import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser();

    // 1. If not logged in via Clerk, return null
    if (!user) {
      return null;
    }

    // 2. Try to find the user in our Database
    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    // 3. If user exists, return them
    if (loggedInUser) {
      return loggedInUser;
    }

    // 4. If not found, create a new user (Sync)
    const newUser = await prisma.user.create({
      data: {
        id: user.id, 
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        credits: 3, 
        plan: "FREE",
        role: "USER" 
      },
    });

    return newUser;
    
  } catch (error) {
    // --- RACE CONDITION FIX ---
    // If Prisma throws P2002 (Unique Constraint Failed), it means another request 
    // created the user milliseconds before this one. We just fetch and return it.
    if (error.code === 'P2002') {
        const existingUser = await prisma.user.findUnique({
            where: { id: (await currentUser()).id },
        });
        return existingUser;
    }

    console.error("Error in checkUser:", error);
    return null;
  }
};