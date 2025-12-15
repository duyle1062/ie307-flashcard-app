import { executeQuery } from "./database";
import { generateUUID, insertWithSync } from "./helpers";
import * as Crypto from "expo-crypto";

/**
 * Seed database with initial data for a specific user
 * Run this once to populate the database with sample programming flashcards
 * @param userId - The user ID to create collections and cards for (optional, will use first available user if not provided)
 */
export const seedDatabase = async (userId?: string): Promise<void> => {
  try {
    console.log("🌱 Starting database seeding...");

    // Get the user ID (either provided or first user in database)
    let mainUserId = userId;

    if (!mainUserId) {
      const userResult = await executeQuery("SELECT id FROM users LIMIT 1", []);

      if (userResult.rows.length === 0) {
        console.log("⚠️ No users found. Please login first before seeding.");
        return;
      }

      mainUserId = userResult.rows.item(0).id;
    }

    console.log(`✅ Seeding for user: ${mainUserId}`);

    // Check if this user already has seed data
    const existingSeedCollections = await executeQuery(
      "SELECT COUNT(*) as count FROM collections WHERE user_id = ? AND name = ?",
      [mainUserId, "JavaScript Fundamentals"]
    );
    if (existingSeedCollections.rows.item(0).count > 0) {
      console.log("⚠️ Seed data already exists for this user. Skipping seed.");
      return;
    }

    // Clean up any old mock/test collections for this user
    console.log("🧹 Cleaning up old collections...");
    await executeQuery(
      "DELETE FROM cards WHERE collection_id IN (SELECT id FROM collections WHERE user_id = ?)",
      [mainUserId]
    );
    await executeQuery("DELETE FROM collections WHERE user_id = ?", [
      mainUserId,
    ]);
    console.log("✅ Old collections cleaned up");

    // 2. Create 3 collections for Alex Duong
    const collections = [
      {
        id: generateUUID(),
        user_id: mainUserId,
        name: "JavaScript Fundamentals",
        description: "Core JavaScript concepts and syntax",
        is_deleted: 0,
        created_at: "2025-11-05T10:00:00Z",
        updated_at: "2025-11-05T10:00:00Z",
      },
      {
        id: generateUUID(),
        user_id: mainUserId,
        name: "React Essentials",
        description: "Key React concepts, hooks, and patterns",
        is_deleted: 0,
        created_at: "2025-11-08T10:00:00Z",
        updated_at: "2025-11-08T10:00:00Z",
      },
      {
        id: generateUUID(),
        user_id: mainUserId,
        name: "Data Structures & Algorithms",
        description: "Common data structures and algorithm patterns",
        is_deleted: 0,
        created_at: "2025-11-10T10:00:00Z",
        updated_at: "2025-11-10T10:00:00Z",
      },
    ];

    console.log("Creating collections...");
    for (const collection of collections) {
      await insertWithSync("collections", {
        id: collection.id,
        user_id: collection.user_id,
        name: collection.name,
        description: collection.description,
        is_deleted: collection.is_deleted,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
      });
    }
    console.log("✅ Created 3 collections");

    // 3. Create cards for each collection
    const cardsData = [
      // Collection 1: JavaScript Fundamentals (10 cards)
      {
        collection_id: collections[0].id,
        cards: [
          {
            front: "What is a closure in JavaScript?",
            back: "A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.",
            status: "review" as const,
            interval: 7,
            ef: 2.6,
            due_date: "2025-12-15",
          },
          {
            front: "What is the difference between let, const, and var?",
            back: "var is function-scoped and hoisted; let and const are block-scoped. const cannot be reassigned, while let can. let and const are not hoisted in the same way.",
            status: "learning" as const,
            interval: 1,
            ef: 2.4,
            due_date: "2025-12-13",
          },
          {
            front: "What is event delegation?",
            back: "Event delegation is a technique where you attach a single event listener to a parent element to handle events from multiple child elements, using event bubbling.",
            status: "review" as const,
            interval: 14,
            ef: 2.8,
            due_date: "2025-12-20",
          },
          {
            front: "What is the difference between == and ===?",
            back: "== performs type coercion before comparison (loose equality), while === compares both value and type without coercion (strict equality).",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
          {
            front: "What is the purpose of 'use strict'?",
            back: "Strict mode enables stricter parsing and error handling, catches common coding mistakes, prevents unsafe actions, and disables certain deprecated features.",
            status: "learning" as const,
            interval: 3,
            ef: 2.5,
            due_date: "2025-12-14",
          },
          {
            front: "What is hoisting in JavaScript?",
            back: "Hoisting is JavaScript's behavior of moving declarations to the top of their scope before code execution. Variables declared with var and function declarations are hoisted.",
            status: "review" as const,
            interval: 10,
            ef: 2.7,
            due_date: "2025-12-18",
          },
          {
            front: "What is the event loop?",
            back: "The event loop is JavaScript's mechanism for handling asynchronous operations. It continuously checks the call stack and task queue, executing callbacks when the stack is empty.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
          {
            front: "What is a Promise?",
            back: "A Promise is an object representing the eventual completion or failure of an asynchronous operation, with methods like .then(), .catch(), and .finally().",
            status: "learning" as const,
            interval: 1,
            ef: 2.3,
            due_date: "2025-12-13",
          },
          {
            front: "What is the difference between null and undefined?",
            back: "undefined means a variable has been declared but not assigned a value. null is an assignment value representing no value or empty object reference.",
            status: "review" as const,
            interval: 5,
            ef: 2.6,
            due_date: "2025-12-16",
          },
          {
            front: "What is destructuring in JavaScript?",
            back: "Destructuring is a syntax for extracting values from arrays or properties from objects into distinct variables in a concise way.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
        ],
      },
      // Collection 2: React Essentials (10 cards)
      {
        collection_id: collections[1].id,
        cards: [
          {
            front: "What is the difference between state and props?",
            back: "State is internal and managed by the component itself; props are external and passed from parent to child. State is mutable, props are immutable in the receiving component.",
            status: "review" as const,
            interval: 12,
            ef: 2.7,
            due_date: "2025-12-19",
          },
          {
            front: "What is the useEffect hook used for?",
            back: "useEffect handles side effects like data fetching, subscriptions, or DOM manipulation. It runs after render and can optionally clean up and control when it re-runs with dependencies.",
            status: "learning" as const,
            interval: 2,
            ef: 2.4,
            due_date: "2025-12-14",
          },
          {
            front: "What is JSX?",
            back: "JSX is a syntax extension for JavaScript that allows writing HTML-like code in JavaScript files. It's transformed into React.createElement() calls.",
            status: "review" as const,
            interval: 8,
            ef: 2.6,
            due_date: "2025-12-17",
          },
          {
            front: "What is the virtual DOM?",
            back: "The virtual DOM is a lightweight copy of the actual DOM. React uses it to efficiently update only the changed parts of the real DOM through reconciliation.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
          {
            front: "What is prop drilling and how to avoid it?",
            back: "Prop drilling is passing props through multiple component layers. Avoid it using Context API, Redux, or component composition patterns.",
            status: "learning" as const,
            interval: 1,
            ef: 2.3,
            due_date: "2025-12-13",
          },
          {
            front:
              "What is the difference between controlled and uncontrolled components?",
            back: "Controlled components have their form data handled by React state. Uncontrolled components store their own state internally and use refs to access values.",
            status: "review" as const,
            interval: 15,
            ef: 2.8,
            due_date: "2025-12-21",
          },
          {
            front: "What is React.memo()?",
            back: "React.memo() is a higher-order component that prevents re-renders if props haven't changed. It does shallow comparison of props by default.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
          {
            front: "What is the purpose of keys in React lists?",
            back: "Keys help React identify which items have changed, been added, or removed. They should be stable, unique identifiers for efficient reconciliation.",
            status: "learning" as const,
            interval: 3,
            ef: 2.5,
            due_date: "2025-12-15",
          },
          {
            front: "What is the useCallback hook?",
            back: "useCallback returns a memoized callback function that only changes if dependencies change. It prevents unnecessary re-creation of functions on re-renders.",
            status: "review" as const,
            interval: 6,
            ef: 2.6,
            due_date: "2025-12-16",
          },
          {
            front: "What is lazy loading in React?",
            back: "Lazy loading splits code into chunks that are loaded on demand using React.lazy() and Suspense. It reduces initial bundle size and improves performance.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
        ],
      },
      // Collection 3: Data Structures & Algorithms (10 cards)
      {
        collection_id: collections[2].id,
        cards: [
          {
            front: "What is Big O notation?",
            back: "Big O notation describes the upper bound of an algorithm's time or space complexity as input size grows, focusing on worst-case performance.",
            status: "review" as const,
            interval: 9,
            ef: 2.7,
            due_date: "2025-12-18",
          },
          {
            front: "What is the time complexity of binary search?",
            back: "O(log n) - Binary search divides the search space in half with each iteration, making it very efficient for sorted arrays.",
            status: "learning" as const,
            interval: 2,
            ef: 2.4,
            due_date: "2025-12-14",
          },
          {
            front: "What is a hash table?",
            back: "A hash table is a data structure that maps keys to values using a hash function. It provides O(1) average-case lookup, insert, and delete operations.",
            status: "review" as const,
            interval: 11,
            ef: 2.6,
            due_date: "2025-12-19",
          },
          {
            front: "What is the difference between stack and queue?",
            back: "Stack is LIFO (Last In First Out) - add/remove from the same end. Queue is FIFO (First In First Out) - add at one end, remove from the other.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
          {
            front: "What is depth-first search (DFS)?",
            back: "DFS explores as far as possible along each branch before backtracking. It can be implemented recursively or with a stack. Good for path finding and tree traversal.",
            status: "learning" as const,
            interval: 1,
            ef: 2.3,
            due_date: "2025-12-13",
          },
          {
            front: "What is breadth-first search (BFS)?",
            back: "BFS explores all neighbors at the current depth before moving to the next level. Uses a queue. Good for finding shortest paths in unweighted graphs.",
            status: "review" as const,
            interval: 13,
            ef: 2.8,
            due_date: "2025-12-20",
          },
          {
            front: "What is a linked list?",
            back: "A linear data structure where elements (nodes) contain data and a pointer to the next node. Allows efficient insertion/deletion but slower access than arrays.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
          {
            front: "What is the difference between quicksort and mergesort?",
            back: "Quicksort: O(n log n) average, O(n²) worst, in-place, unstable. Mergesort: O(n log n) always, uses extra space, stable. Mergesort better for linked lists.",
            status: "learning" as const,
            interval: 4,
            ef: 2.5,
            due_date: "2025-12-15",
          },
          {
            front: "What is a binary tree?",
            back: "A hierarchical data structure where each node has at most two children (left and right). Special types include BST, AVL tree, and red-black tree.",
            status: "review" as const,
            interval: 7,
            ef: 2.6,
            due_date: "2025-12-17",
          },
          {
            front: "What is dynamic programming?",
            back: "An optimization technique that breaks problems into overlapping subproblems, solves each once, and stores results (memoization or tabulation) to avoid redundant calculations.",
            status: "new" as const,
            interval: 0,
            ef: 2.5,
            due_date: "2025-12-12",
          },
        ],
      },
    ];

    console.log("Creating cards...");
    let totalCards = 0;
    for (const collectionData of cardsData) {
      for (const card of collectionData.cards) {
        const cardId = generateUUID();
        await insertWithSync("cards", {
          id: cardId,
          collection_id: collectionData.collection_id,
          front: card.front,
          back: card.back,
          status: card.status,
          interval: card.interval,
          ef: card.ef,
          due_date: card.due_date,
          is_deleted: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        totalCards++;
      }
    }
    console.log(`✅ Created ${totalCards} cards`);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};
