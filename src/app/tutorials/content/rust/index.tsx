"use client";

import { useState } from "react";
import "./index.css";

type IntroSection = {
  type: "intro";
  content: string;
};

type AnalogySection = {
  type: "analogy";
  title: string;
  content: string;
};

type CodeSection = {
  type: "code";
  title: string;
  explanation?: string;
  code: string;
};

type BreakdownSection = {
  type: "breakdown";
  title: string;
  items: Array<{ part: string; desc: string }>;
};

type TableSection = {
  type: "table";
  title: string;
  headers: string[];
  rows: string[][];
};

type TutorialSection =
  | IntroSection
  | AnalogySection
  | CodeSection
  | BreakdownSection
  | TableSection;

const chapters: Array<{
  id: number;
  title: string;
  emoji: string;
  tagline: string;
  color: string;
  sections: TutorialSection[];
}> = [
  {
    id: 1,
    title: "What is Rust?",
    emoji: "🦀",
    tagline: "Meet your new favorite language",
    color: "#FF6B35",
    sections: [
      {
        type: "intro",
        content: `Rust is a **systems programming language** created by Mozilla in 2010. It's designed to be:
- **Fast** — as fast as C and C++
- **Safe** — it prevents common bugs like crashes and memory errors *at compile time*
- **Concurrent** — great for modern multi-core programs

Think of Rust as C++ with a safety harness. You get the raw power of low-level programming, but Rust's compiler acts like a strict-but-caring teacher that catches your mistakes before they become disasters.`
      },
      {
        type: "analogy",
        title: "🧠 The Rust Analogy",
        content: `Imagine you're building with LEGO bricks, but there's a robot assistant watching you. Before you can place a piece, the robot checks: "Is this piece available? Are you the only one using it? Will it fit here without breaking the structure?" If something's wrong, the robot stops you immediately — before the whole structure collapses. That robot is Rust's compiler.`
      },
      {
        type: "code",
        title: "Your First Rust Program",
        explanation: "Every Rust program starts with a 'main' function. Think of it as the front door of your program — execution always begins here. 'println!' is a macro (notice the '!') that prints text to the screen.",
        code: `fn main() {
    println!("Hello, world! 🦀");
}`
      },
      {
        type: "breakdown",
        title: "🔍 Breaking It Down",
        items: [
          { part: "fn", desc: "Short for 'function'. This keyword declares a new function." },
          { part: "main", desc: "The special name for the entry point. Every Rust program needs a main function." },
          { part: "()", desc: "Empty parentheses mean this function takes no parameters (inputs)." },
          { part: "{ }", desc: "Curly braces wrap the function body — the code that runs." },
          { part: 'println!("...")', desc: "A macro that prints text followed by a newline. The '!' marks it as a macro, not a regular function." },
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Variables & Data Types",
    emoji: "📦",
    tagline: "How Rust stores information",
    color: "#4ECDC4",
    sections: [
      {
        type: "intro",
        content: `Variables are **named storage boxes** for your data. In Rust, there's a twist: variables are **immutable by default**, meaning once you set a value, you can't change it unless you explicitly say so. This is one of Rust's safety features — accidental mutation is a common source of bugs!`
      },
      {
        type: "code",
        title: "Declaring Variables",
        explanation: "Use 'let' to create a variable. By default, it's immutable (locked). Add 'mut' to make it mutable (changeable). Rust can usually figure out the type automatically — this is called 'type inference'.",
        code: `fn main() {
    // Immutable variable — cannot be changed
    let name = "Rustacean";

    // Mutable variable — can be changed later
    let mut score = 0;
    score = 100; // This works because of 'mut'

    // Explicit type annotation
    let age: u32 = 25; // u32 = unsigned 32-bit integer

    println!("Name: {}", name);
    println!("Score: {}", score);
    println!("Age: {}", age);
}`
      },
      {
        type: "table",
        title: "📊 Common Data Types",
        headers: ["Type", "Example", "What it stores"],
        rows: [
          ["i32", "let x: i32 = -42;", "Whole numbers (negative or positive)"],
          ["u32", "let x: u32 = 42;", "Whole numbers (positive only, 'unsigned')"],
          ["f64", "let x: f64 = 3.14;", "Decimal numbers (floating point)"],
          ["bool", "let x: bool = true;", "True or false values"],
          ["char", "let x: char = 'A';", "A single character (use single quotes!)"],
          ["String", 'let x = String::from("hi");', "A sequence of characters (text)"],
          ["&str", 'let x: &str = "hi";', "A string slice (borrowed text)"],
        ]
      },
      {
        type: "code",
        title: "Constants vs Variables",
        explanation: "Constants are like variables but ALWAYS immutable and must have their type declared. Use SCREAMING_SNAKE_CASE by convention. Constants are evaluated at compile time.",
        code: `// Constants are declared with 'const'
// Type annotation is REQUIRED
// Must be set to a fixed value
const MAX_POINTS: u32 = 100_000; // _ is just for readability

fn main() {
    println!("Max points: {}", MAX_POINTS);

    // Shadowing: re-declare a variable with 'let'
    let x = 5;
    let x = x + 1; // This creates a NEW x, shadowing the old one
    let x = x * 2;
    println!("x is: {}", x); // Prints 12
}`
      },
      {
        type: "analogy",
        title: "💡 Why Immutable by Default?",
        content: `Imagine a whiteboard in an office. If anyone can walk up and erase things, you'll never be sure what's written there. But if the board is "read-only" unless someone explicitly unlocks it, you have confidence that data won't change unexpectedly. Rust's immutability-by-default gives you that confidence in your code.`
      }
    ]
  },
  {
    id: 3,
    title: "Functions",
    emoji: "⚙️",
    tagline: "Reusable blocks of logic",
    color: "#A8E6CF",
    sections: [
      {
        type: "intro",
        content: `Functions let you **package up code** so you can reuse it. You define a function once, then call it as many times as you need. Functions can accept **parameters** (inputs) and **return** values (outputs).`
      },
      {
        type: "code",
        title: "Basic Functions",
        explanation: "Define functions with 'fn'. Parameters must have type annotations. The return type comes after '->' (an arrow). The last expression in a function is automatically returned — no 'return' keyword needed (though you can use it).",
        code: `// A function that takes two numbers and returns their sum
fn add(a: i32, b: i32) -> i32 {
    a + b  // No semicolon! This is the return value.
}

// A function that returns nothing (unit type)
fn greet(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    let result = add(5, 3);
    println!("5 + 3 = {}", result); // Prints: 5 + 3 = 8

    greet("Alice"); // Prints: Hello, Alice!
}`
      },
      {
        type: "breakdown",
        title: "🔍 The Return Value Secret",
        items: [
          { part: "a + b", desc: "Expression WITHOUT a semicolon — this is the return value" },
          { part: "a + b;", desc: "Statement WITH a semicolon — this returns nothing (unit type ())" },
          { part: "return a + b;", desc: "Explicit return — needed for early returns from a function" },
        ]
      },
      {
        type: "code",
        title: "Functions with Multiple Returns",
        explanation: "Rust functions can only return one value, but you can 'cheat' by returning a tuple — a fixed-size collection of values of different types.",
        code: `fn min_max(numbers: &[i32]) -> (i32, i32) {
    let mut min = numbers[0];
    let mut max = numbers[0];

    for &num in numbers {
        if num < min { min = num; }
        if num > max { max = num; }
    }

    (min, max) // Return a tuple
}

fn main() {
    let nums = [3, 1, 4, 1, 5, 9, 2, 6];
    let (min, max) = min_max(&nums); // Destructure the tuple
    println!("Min: {}, Max: {}", min, max);
}`
      }
    ]
  },
  {
    id: 4,
    title: "Ownership",
    emoji: "🏠",
    tagline: "Rust's superpower (and brain-twister)",
    color: "#FFD93D",
    sections: [
      {
        type: "intro",
        content: `Ownership is Rust's **most unique feature** and what makes it memory-safe without a garbage collector. Every value in Rust has exactly ONE owner. When the owner goes away (leaves scope), the value is automatically cleaned up. No memory leaks. No dangling pointers. Guaranteed.

The three rules of ownership:
1. Each value has exactly one owner
2. There can only be one owner at a time
3. When the owner goes out of scope, the value is dropped`
      },
      {
        type: "analogy",
        title: "🏠 The House Analogy",
        content: `Think of values like houses. Each house has exactly one owner. If you "move" a house to someone else, YOU no longer own it — you can't enter it anymore. But you can "lend" someone a key (a reference) so they can visit without taking ownership. Rust enforces all of this automatically.`
      },
      {
        type: "code",
        title: "Move Semantics",
        explanation: "When you assign a heap-allocated value (like a String) to another variable, ownership 'moves'. The original variable is no longer valid. This prevents two places from trying to free the same memory.",
        code: `fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // Ownership MOVES to s2

    // println!("{}", s1); // ERROR! s1 no longer owns the data

    println!("{}", s2); // This is fine

    // For simple types (integers, bools, chars), values are COPIED:
    let x = 5;
    let y = x; // x is copied, not moved
    println!("x={}, y={}", x, y); // Both work fine!
}`
      },
      {
        type: "code",
        title: "Borrowing with References",
        explanation: "Instead of moving ownership, you can 'borrow' a value by creating a reference with '&'. The borrower can use the value but doesn't own it. There can be multiple immutable borrows, or ONE mutable borrow — never both at the same time.",
        code: `fn calculate_length(s: &String) -> usize {
    s.len() // We can use s, but don't own it
} // s goes out of scope, but nothing is dropped (we don't own it)

fn main() {
    let s1 = String::from("hello");

    // Pass a reference — s1 still owns the data
    let len = calculate_length(&s1);

    // s1 is still valid here!
    println!("'{}' has {} characters", s1, len);

    // Mutable reference
    let mut s = String::from("hello");
    change(&mut s);
    println!("{}", s); // "hello world"
}

fn change(s: &mut String) {
    s.push_str(" world");
}`
      }
    ]
  },
  {
    id: 5,
    title: "Control Flow",
    emoji: "🔀",
    tagline: "Making decisions and repeating actions",
    color: "#C3B1E1",
    sections: [
      {
        type: "intro",
        content: `Control flow lets your program **make decisions** and **repeat actions**. Rust has the standard toolkit: if/else for decisions, and several types of loops for repetition. But Rust adds some elegant twists!`
      },
      {
        type: "code",
        title: "if / else if / else",
        explanation: "Rust's if expressions work like most languages, but with a key bonus: they can return values! No need for a ternary operator.",
        code: `fn main() {
    let temperature = 22;

    // Standard if/else
    if temperature > 30 {
        println!("It's hot!");
    } else if temperature > 20 {
        println!("It's pleasant!");
    } else {
        println!("It's cold!");
    }

    // if as an expression — returns a value!
    let description = if temperature > 25 { "warm" } else { "cool" };
    println!("The weather is {}", description);
}`
      },
      {
        type: "code",
        title: "Loops",
        explanation: "Rust has three types of loops: 'loop' (infinite, break to exit), 'while' (condition-based), and 'for' (iterate over collections). 'for' is the most commonly used and safest.",
        code: `fn main() {
    // 'loop' — runs forever until 'break'
    let mut count = 0;
    let result = loop {
        count += 1;
        if count == 5 {
            break count * 10; // break can return a value!
        }
    };
    println!("Result: {}", result); // 50

    // 'while' — runs while condition is true
    let mut n = 1;
    while n < 32 {
        n *= 2;
    }
    println!("n is {}", n); // 32

    // 'for' — iterate over a range or collection
    for i in 1..=5 {   // 1..=5 means 1, 2, 3, 4, 5 (inclusive)
        print!("{} ", i);
    }
    println!(); // newline

    // Iterate over an array
    let fruits = ["apple", "banana", "cherry"];
    for fruit in &fruits {
        println!("I like {}", fruit);
    }
}`
      },
      {
        type: "code",
        title: "match — Rust's Powerful Switch",
        explanation: "'match' is like a supercharged switch statement. It compares a value against a series of patterns and runs the first one that matches. It must be exhaustive — you must handle ALL possible cases.",
        code: `fn main() {
    let number = 7;

    match number {
        1 => println!("One!"),
        2 | 3 => println!("Two or Three!"), // Multiple patterns
        4..=6 => println!("Four through Six!"), // Range pattern
        n => println!("Something else: {}", n), // Catch-all
    }

    // match can return values too
    let day = "Monday";
    let day_type = match day {
        "Saturday" | "Sunday" => "Weekend",
        _ => "Weekday", // _ matches anything (wildcard)
    };
    println!("{} is a {}", day, day_type);
}`
      }
    ]
  },
  {
    id: 6,
    title: "Structs & Enums",
    emoji: "🏗️",
    tagline: "Building your own data types",
    color: "#FF8B94",
    sections: [
      {
        type: "intro",
        content: `Structs and enums let you **create custom data types** that model real-world concepts. Structs group related data together. Enums represent a value that can be one of several variants. Together, they're incredibly powerful.`
      },
      {
        type: "code",
        title: "Structs",
        explanation: "A struct is like a blueprint for an object. Define the fields (name + type), then create instances. You can add methods to structs using 'impl' blocks.",
        code: `// Define a struct
struct Rectangle {
    width: f64,
    height: f64,
}

// Add methods with 'impl'
impl Rectangle {
    // 'new' is a convention for constructors
    fn new(width: f64, height: f64) -> Rectangle {
        Rectangle { width, height } // Shorthand when field name = variable name
    }

    // '&self' means this method borrows the struct
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        2.0 * (self.width + self.height)
    }

    fn is_square(&self) -> bool {
        self.width == self.height
    }
}

fn main() {
    let rect = Rectangle::new(10.0, 5.0);
    println!("Area: {}", rect.area());
    println!("Perimeter: {}", rect.perimeter());
    println!("Is square? {}", rect.is_square());
}`
      },
      {
        type: "code",
        title: "Enums",
        explanation: "Enums are especially powerful in Rust because each variant can hold different types of data. The 'Option' enum is built into Rust and replaces null — it forces you to handle the 'no value' case explicitly.",
        code: `// Simple enum
enum Direction {
    North,
    South,
    East,
    West,
}

// Enums with data!
enum Shape {
    Circle(f64),              // holds radius
    Rectangle(f64, f64),      // holds width, height
    Triangle(f64, f64, f64),  // holds three sides
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rectangle(w, h) => w * h,
        Shape::Triangle(a, b, c) => {
            let s = (a + b + c) / 2.0;
            (s * (s-a) * (s-b) * (s-c)).sqrt()
        }
    }
}

fn main() {
    let shapes = vec![
        Shape::Circle(5.0),
        Shape::Rectangle(4.0, 6.0),
    ];

    for shape in &shapes {
        println!("Area: {:.2}", area(shape));
    }

    // Option<T> — the safe way to handle "maybe no value"
    let some_number: Option<i32> = Some(42);
    let no_number: Option<i32> = None;

    if let Some(n) = some_number {
        println!("Got a number: {}", n);
    }
}`
      }
    ]
  },
  {
    id: 7,
    title: "Error Handling",
    emoji: "🛡️",
    tagline: "Handling failure gracefully",
    color: "#87CEEB",
    sections: [
      {
        type: "intro",
        content: `Rust has **no exceptions**. Instead, it uses two approaches:
- **panic!** — for unrecoverable errors (like accessing an out-of-bounds index)
- **Result<T, E>** — for recoverable errors (like a file not existing)

The Result enum forces you to explicitly handle errors. This means Rust programs rarely crash unexpectedly!`
      },
      {
        type: "code",
        title: "The Result Type",
        explanation: "Result<T, E> is an enum with two variants: Ok(T) for success and Err(E) for failure. When a function might fail, it returns a Result and the caller must handle both cases.",
        code: `use std::num::ParseIntError;

fn parse_age(s: &str) -> Result<u32, ParseIntError> {
    let age: u32 = s.trim().parse()?; // '?' propagates the error up
    Ok(age)
}

fn main() {
    // Handle with match
    match parse_age("25") {
        Ok(age) => println!("Age: {}", age),
        Err(e) => println!("Error: {}", e),
    }

    // Handle with if let
    if let Ok(age) = parse_age("30") {
        println!("Valid age: {}", age);
    }

    // Use unwrap_or for a default value
    let age = parse_age("abc").unwrap_or(0);
    println!("Age (or 0): {}", age);

    // unwrap() — panics on Err! Use with caution.
    // let age = parse_age("25").unwrap(); // OK here, but risky
}`
      },
      {
        type: "code",
        title: "The ? Operator",
        explanation: "The '?' operator is magic: if a Result is Ok, it unwraps the value. If it's Err, it immediately returns the error from the current function. It makes error propagation clean and readable.",
        code: `use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    // Without ?: you'd need match statements everywhere
    // With ?: errors bubble up automatically!
    let content = fs::read_to_string("username.txt")?;
    Ok(content.trim().to_string())
}

fn main() {
    match read_username_from_file() {
        Ok(name) => println!("Username: {}", name),
        Err(e) => println!("Failed to read file: {}", e),
    }
}`
      },
      {
        type: "analogy",
        title: "🛡️ Why This Design?",
        content: `In many languages, errors are "invisible" — a function might throw an exception you don't know about, and your program crashes. In Rust, if a function can fail, its return type tells you so. You CANNOT ignore errors accidentally. This is like a restaurant that gives you an explicit choice: "Your dish is ready (Ok)" or "We're out of that item (Err)". You must respond to both!`
      }
    ]
  },
  {
    id: 8,
    title: "What's Next?",
    emoji: "🚀",
    tagline: "Your Rust journey continues",
    color: "#DDA0DD",
    sections: [
      {
        type: "intro",
        content: `You've covered the foundations of Rust! You now understand variables, functions, ownership (the big one!), control flow, custom types, and error handling. Here's what to explore next:`
      },
      {
        type: "table",
        title: "🗺️ Learning Roadmap",
        headers: ["Topic", "Why It Matters"],
        rows: [
          ["Traits", "Like interfaces — define shared behavior across types"],
          ["Generics", "Write code that works with any type"],
          ["Lifetimes", "Advanced ownership for complex reference scenarios"],
          ["Collections", "Vec, HashMap, HashSet — store groups of data"],
          ["Iterators & Closures", "Functional programming in Rust — elegant and fast"],
          ["Modules & Crates", "Organize code and use libraries (crates.io)"],
          ["Concurrency", "Fearless parallelism — Rust's killer feature"],
          ["Async/Await", "Non-blocking I/O for web servers, networking"],
          ["Smart Pointers", "Box, Rc, Arc — advanced memory management"],
        ]
      },
      {
        type: "analogy",
        title: "📚 Best Resources",
        content: `• **The Rust Book** (doc.rust-lang.org/book) — Free, comprehensive, official\n• **Rustlings** — Small exercises to practice each concept\n• **Rust by Example** — Learn by reading and modifying real code\n• **crates.io** — Browse the Rust ecosystem of libraries\n• **r/rust** — Friendly community, great for questions\n\nKeep coding, keep experimenting, and embrace the compiler errors — they're your best teacher! 🦀`
      }
    ]
  }
];

export default function RustTutorial() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(
    new Set()
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chapter = chapters[currentChapter];

  const markComplete = () => {
    setCompletedChapters((prev) => new Set([...prev, currentChapter]));
    if (currentChapter < chapters.length - 1) setCurrentChapter(currentChapter + 1);
  };

  const progress = Math.round((completedChapters.size / chapters.length) * 100);

  return (
    <div style={{
      display: "flex",
      minHeight: "70vh",
      width: "100%",
      borderRadius: "1rem",
      border: "1px solid rgba(255,255,255,0.18)",
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(30,41,59,0.35))",
      color: "#e2e8f0",
      overflow: "hidden"
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "280px" : "60px",
        background: "rgba(15,23,42,0.5)",
        borderRight: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        overflow: "hidden",
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: "20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.16)",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#e2e8f0", fontSize: "18px", padding: "4px", flexShrink: 0
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: "16px", fontWeight: "bold", color: "#FF6B35" }}>🦀 Learn Rust</div>
              <div style={{ fontSize: "11px", color: "rgba(191,219,254,0.75)", marginTop: "2px" }}>Zero to Rustacean</div>
            </div>
          )}
        </div>

        {/* Progress */}
        {sidebarOpen && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.16)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", color: "rgba(191,219,254,0.75)" }}>
              <span>Progress</span><span>{progress}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.14)", borderRadius: "4px", height: "6px" }}>
              <div style={{
                width: `${progress}%`, height: "100%",
                background: "linear-gradient(90deg, #FF6B35, #FFD93D)",
                borderRadius: "4px", transition: "width 0.5s ease"
              }} />
            </div>
          </div>
        )}

        {/* Chapter List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {chapters.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => setCurrentChapter(idx)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: sidebarOpen ? "10px 12px" : "10px",
                marginBottom: "4px",
                background: idx === currentChapter ? ch.color + "20" : "transparent",
                border: idx === currentChapter ? `1px solid ${ch.color}40` : "1px solid transparent",
                borderRadius: "8px",
                cursor: "pointer",
                color: idx === currentChapter ? ch.color : "rgba(191,219,254,0.75)",
                textAlign: "left",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{ch.emoji}</span>
              {sidebarOpen && (
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: "13px", fontWeight: idx === currentChapter ? "bold" : "normal", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ch.title}
                  </div>
                </div>
              )}
              {sidebarOpen && completedChapters.has(idx) && (
                <span style={{ color: "#3fb950", flexShrink: 0 }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Chapter Header */}
        <div style={{
          padding: "24px 40px",
          background: `linear-gradient(135deg, ${chapter.color}15, transparent)`,
          borderBottom: "1px solid rgba(255,255,255,0.16)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "12px", color: "rgba(191,219,254,0.75)", fontFamily: "monospace" }}>
              Chapter {chapter.id} of {chapters.length}
            </span>
            {completedChapters.has(currentChapter) && (
              <span style={{ fontSize: "11px", color: "#3fb950", background: "#3fb95020", padding: "2px 8px", borderRadius: "12px" }}>
                ✓ Completed
              </span>
            )}
          </div>
          <h1 style={{ margin: 0, fontSize: "28px", color: chapter.color }}>
            {chapter.emoji} {chapter.title}
          </h1>
          <p style={{ margin: "4px 0 0", color: "rgba(191,219,254,0.8)", fontStyle: "italic" }}>{chapter.tagline}</p>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          {chapter.sections.map((section, i) => (
            <SectionBlock key={i} section={section} chapterColor={chapter.color} />
          ))}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.16)" }}>
            <button
              onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
              disabled={currentChapter === 0}
              style={{
                padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)", color: currentChapter === 0 ? "rgba(148,163,184,0.45)" : "#e2e8f0",
                cursor: currentChapter === 0 ? "not-allowed" : "pointer", fontSize: "14px"
              }}
            >
              ← Previous
            </button>

            <button
              onClick={markComplete}
              style={{
                padding: "12px 28px", borderRadius: "8px", border: "none",
                background: completedChapters.has(currentChapter)
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : `linear-gradient(135deg, ${chapter.color}, ${chapter.color}cc)`,
                color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "bold",
                boxShadow: `0 4px 20px ${chapter.color}40`
              }}
            >
              {completedChapters.has(currentChapter)
                ? currentChapter < chapters.length - 1 ? "✓ Next Chapter →" : "✓ Complete!"
                : currentChapter < chapters.length - 1 ? "Mark Complete & Continue →" : "🎉 Finish Tutorial"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  chapterColor,
}: {
  section: TutorialSection;
  chapterColor: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (section.type === "intro") {
    return (
      <div style={{ marginBottom: "32px" }}>
        <div style={{ lineHeight: "1.8", fontSize: "15px", color: "rgba(219,234,254,0.9)" }}>
          {section.content.split("\n").map((line, i) => {
            if (line.startsWith("- ")) {
              return (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: chapterColor }}>▸</span>
                  <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, `<strong style="color:${chapterColor}">$1</strong>`) }} />
                </div>
              );
            }
            if (line.match(/^\d+\./)) {
              const numericPrefix = line.match(/^\d+/)?.[0] ?? "";
              return (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ color: chapterColor, fontWeight: "bold" }}>{numericPrefix}.</span>
                  <span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, "").replace(/\*\*(.*?)\*\*/g, `<strong style="color:${chapterColor}">$1</strong>`) }} />
                </div>
              );
            }
            return line ? (
              <p key={i} style={{ margin: "0 0 12px", lineHeight: "1.8" }}
                dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, `<strong style="color:${chapterColor}">$1</strong>`) }}
              />
            ) : null;
          })}
        </div>
      </div>
    );
  }

  if (section.type === "analogy") {
    return (
      <div style={{
        marginBottom: "28px",
        padding: "20px 24px",
        background: chapterColor + "10",
        border: `1px solid ${chapterColor}30`,
        borderLeft: `4px solid ${chapterColor}`,
        borderRadius: "8px"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "10px", color: chapterColor }}>{section.title}</div>
        <div style={{ lineHeight: "1.8", fontSize: "14px", color: "rgba(219,234,254,0.9)" }}>
          {section.content.split("\n").map((line, i) =>
            line ? <p key={i} style={{ margin: "0 0 8px" }}
              dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`) }}
            /> : null
          )}
        </div>
      </div>
    );
  }

  if (section.type === "code") {
    return (
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px", color: chapterColor }}>
          {section.title}
        </div>
        {section.explanation && (
          <p style={{ color: "rgba(191,219,254,0.78)", fontSize: "14px", marginBottom: "12px", lineHeight: "1.6" }}>
            {section.explanation}
          </p>
        )}
        <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.18)" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 16px", background: "rgba(15,23,42,0.75)", borderBottom: "1px solid rgba(255,255,255,0.16)"
          }}>
            <span style={{ fontSize: "12px", color: "rgba(191,219,254,0.8)", fontFamily: "monospace" }}>main.rs</span>
            <button
              onClick={() => handleCopy(section.code)}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "4px",
                color: "rgba(191,219,254,0.8)", cursor: "pointer", fontSize: "11px", padding: "2px 10px"
              }}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <pre style={{
            margin: 0, padding: "20px", background: "rgba(2,6,23,0.9)",
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontSize: "13px", lineHeight: "1.7", overflowX: "auto",
            color: "rgba(241,245,249,0.95)"
          }}>
            <RustHighlight code={section.code} />
          </pre>
        </div>
      </div>
    );
  }

  if (section.type === "breakdown") {
    return (
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "12px", color: chapterColor }}>
          {section.title}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {section.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: "16px", alignItems: "flex-start",
              padding: "12px 16px", background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.14)", borderRadius: "8px"
            }}>
              <code style={{
                background: chapterColor + "20", color: chapterColor,
                padding: "2px 8px", borderRadius: "4px", fontSize: "13px",
                fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0
              }}>
                {item.part}
              </code>
              <span style={{ fontSize: "14px", color: "rgba(219,234,254,0.9)", lineHeight: "1.5" }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "table") {
    return (
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "12px", color: chapterColor }}>
          {section.title}
        </div>
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(15,23,42,0.72)" }}>
                {section.headers.map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 16px", textAlign: "left", fontSize: "12px",
                    color: chapterColor, fontWeight: "bold", textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.14)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.04)" }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: "10px 16px", fontSize: "13px",
                      fontFamily: j === 0 || j === 1 ? "monospace" : "inherit",
                      color: j === 0 ? chapterColor : "rgba(219,234,254,0.9)"
                    }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

function RustHighlight({ code }: { code: string }) {
  const keywords = ["fn", "let", "mut", "const", "if", "else", "match", "loop", "while", "for", "in", "return", "use", "pub", "struct", "enum", "impl", "break", "continue", "true", "false", "Some", "None", "Ok", "Err", "Self", "self"];
  const types = ["i32", "u32", "i64", "u64", "f64", "f32", "bool", "char", "String", "str", "usize", "Option", "Result", "Vec"];

  const tokens = [];
  let remaining = code;

  while (remaining.length > 0) {
    // Comments
    if (remaining.startsWith("//")) {
      const end = remaining.indexOf("\n");
      const comment = end === -1 ? remaining : remaining.slice(0, end);
      tokens.push(<span key={tokens.length} style={{ color: "#6e7681" }}>{comment}</span>);
      remaining = end === -1 ? "" : remaining.slice(end);
      continue;
    }
    // Strings
    if (remaining[0] === '"') {
      let i = 1;
      while (i < remaining.length && remaining[i] !== '"') {
        if (remaining[i] === '\\') i++;
        i++;
      }
      const str = remaining.slice(0, i + 1);
      tokens.push(<span key={tokens.length} style={{ color: "#a5d6ff" }}>{str}</span>);
      remaining = remaining.slice(i + 1);
      continue;
    }
    // Chars
    if (remaining[0] === "'") {
      const end = remaining.indexOf("'", 1);
      if (end !== -1 && end <= 3) {
        const ch = remaining.slice(0, end + 1);
        tokens.push(<span key={tokens.length} style={{ color: "#a5d6ff" }}>{ch}</span>);
        remaining = remaining.slice(end + 1);
        continue;
      }
    }
    // Macros (word followed by !)
    const macroMatch = remaining.match(/^([a-z_][a-z0-9_]*)!/i);
    if (macroMatch) {
      tokens.push(<span key={tokens.length} style={{ color: "#e09955" }}>{macroMatch[0]}</span>);
      remaining = remaining.slice(macroMatch[0].length);
      continue;
    }
    // Words (keywords, types, identifiers)
    const wordMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      let color = "#e6edf3";
      if (keywords.includes(word)) color = "#ff7b72";
      else if (types.includes(word)) color = "#ffa657";
      tokens.push(<span key={tokens.length} style={{ color }}>{word}</span>);
      remaining = remaining.slice(word.length);
      continue;
    }
    // Numbers
    const numMatch = remaining.match(/^[0-9][0-9_]*/);
    if (numMatch) {
      tokens.push(<span key={tokens.length} style={{ color: "#79c0ff" }}>{numMatch[0]}</span>);
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }
    // Other characters
    tokens.push(<span key={tokens.length}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{tokens}</>;
}
