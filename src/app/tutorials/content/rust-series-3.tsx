"use client";

import { Fragment, useState } from "react";
import type { ReactNode } from "react";

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

type TableSection = {
  type: "table";
  title: string;
  headers: string[];
  rows: string[][];
};

type TutorialSection = IntroSection | AnalogySection | CodeSection | TableSection;

type Chapter = {
  id: number;
  part: number;
  partLabel: string;
  title: string;
  emoji: string;
  tagline: string;
  color: string;
  sections: TutorialSection[];
};

const chapters: Chapter[] = [
  // ─── PART 1: LIFETIMES ───
  {
    id: 1, part: 1, partLabel: "Lifetimes",
    title: "What Are Lifetimes?",
    emoji: "⏳", tagline: "Teaching the compiler how long references live",
    color: "#C084FC",
    sections: [
      {
        type: "intro",
        content: `You already know that Rust's ownership system prevents dangling references. But sometimes the compiler needs YOUR help to figure out how long a reference is valid — especially when multiple references are involved.\n\nA **lifetime** is a label that describes how long a reference is valid. Lifetimes don't change how long things live — they just *describe* it so the compiler can verify safety.\n\nThe good news: Rust infers lifetimes automatically in most cases. You only need to write them explicitly when the compiler can't figure it out on its own.`
      },
      {
        type: "analogy",
        title: "⏳ The Analogy: Library Books",
        content: `Imagine you borrow a book from a library. The library has rules: you can't keep reading a book after you've returned it. The librarian (Rust's compiler) tracks when each book was borrowed and when it must be returned.\n\nNow imagine you photocopy a page from the book. That photocopy is only valid while you still have the book. If you return the book but keep the photocopy and try to use it — that's a dangling reference! Lifetimes are how the compiler tracks these "how long is this reference valid?" relationships.`
      },
      {
        type: "code",
        title: "The Dangling Reference Problem",
        explanation: "This is the bug lifetimes prevent. The compiler catches this at compile time — no runtime crash.",
        code: `fn main() {
    let reference;

    {
        let value = 5;
        reference = &value; // Borrow 'value'
    } // 'value' is dropped here — it's gone!

    // ERROR: 'value' does not live long enough
    // println!("{}", reference); // Would be a dangling reference!
}

// The compiler's error message is very clear:
// "borrowed value does not live long enough"
// This is exactly the kind of bug C/C++ programs crash from.
// Rust catches it before your program even runs.`
      },
      {
        type: "code",
        title: "When Lifetimes Are Inferred (Most of the Time)",
        explanation: "Rust has 'lifetime elision rules' — patterns so common that the compiler handles them automatically. You don't write lifetimes here, but they exist implicitly.",
        code: `// Rust infers the lifetime here — no annotation needed
// The returned reference lives as long as the input reference
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            return &s[0..i];
        }
    }
    &s[..]
}

fn main() {
    let sentence = String::from("hello world");
    let word = first_word(&sentence);
    // 'word' borrows from 'sentence', so both must be alive together
    println!("First word: {}", word);
    // sentence.clear(); // ERROR: can't mutate while word borrows it
}`
      }
    ]
  },
  {
    id: 2, part: 1, partLabel: "Lifetimes",
    title: "Lifetime Annotations",
    emoji: "🏷️", tagline: "Describing relationships between references",
    color: "#C084FC",
    sections: [
      {
        type: "intro",
        content: `When a function takes multiple references and returns a reference, the compiler needs to know: "which input is the returned reference connected to?"\n\nLifetime annotations use the syntax \`'a\` (a tick followed by a name). They don't change how long things live — they just label the relationship so the compiler can verify it.\n\nThe annotation \`'a\` means: "this reference is valid for at least as long as lifetime 'a".`
      },
      {
        type: "code",
        title: "Annotating a Function",
        explanation: "Without the lifetime annotation, the compiler can't know which input the output borrows from. With 'a, you're saying: the output lives at least as long as BOTH inputs (the shorter of the two).",
        code: `// Without annotation — compiler error!
// fn longest(x: &str, y: &str) -> &str { ... }

// With lifetime annotation 'a:
// "The returned reference will be valid as long as
//  BOTH x AND y are valid"
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("long string");

    let result;
    {
        let s2 = String::from("xyz");
        result = longest(s1.as_str(), s2.as_str());
        println!("Longest: {}", result); // OK — both alive here
    }

    // println!("{}", result); // ERROR! s2 dropped, result might point to it
}

// Rule of thumb: the returned reference's lifetime =
// the SHORTEST lifetime among the inputs it might come from.`
      },
      {
        type: "code",
        title: "Lifetimes in Structs",
        explanation: "If a struct holds a reference, it needs a lifetime annotation. This tells Rust: 'an instance of this struct cannot outlive the reference it holds'.",
        code: `// This struct holds a reference — needs a lifetime
struct Excerpt<'a> {
    text: &'a str, // the referenced data must live >= the struct
}

impl<'a> Excerpt<'a> {
    fn announce(&self, announcement: &str) -> &str {
        println!("Attention: {}", announcement);
        self.text // returns reference with lifetime 'a
    }
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");

    let first_sentence;
    {
        let i = novel.find('.').unwrap_or(novel.len());
        first_sentence = &novel[..i];
    }

    // 'novel' still alive, so 'first_sentence' is valid
    let excerpt = Excerpt { text: first_sentence };
    println!("Excerpt: {}", excerpt.announce("New chapter!"));
}`
      },
      {
        type: "code",
        title: "The 'static Lifetime",
        explanation: "'static is a special lifetime meaning the reference is valid for the ENTIRE program duration. String literals are always 'static because they're baked into the binary.",
        code: `// String literals have 'static lifetime — they live forever
let s: &'static str = "I am baked into the binary";

// Common in error messages
fn get_error_message(code: u32) -> &'static str {
    match code {
        404 => "Not found",
        500 => "Internal server error",
        _   => "Unknown error",
    }
}

fn main() {
    let msg = get_error_message(404);
    println!("{}", msg); // "Not found"
    // This reference is valid for the entire program!

    // DON'T use 'static as a lazy workaround.
    // Only use it when the data genuinely lives forever.
}

// The full combo: Generic + Trait Bound + Lifetime
fn longest_with_announcement<'a, T>(
    x: &'a str,
    y: &'a str,
    ann: T,
) -> &'a str
where
    T: std::fmt::Display,
{
    println!("Announcement: {}", ann);
    if x.len() > y.len() { x } else { y }
}`
      },
      {
        type: "table",
        title: "📋 Lifetime Rules Cheat Sheet",
        headers: ["Situation", "Lifetime needed?", "Example"],
        rows: [
          ["Function, one &input, returns &", "No — elided automatically", "fn foo(x: &str) -> &str"],
          ["Function, multiple &inputs, returns &", "Yes — ambiguous otherwise", "fn foo<'a>(x: &'a str, y: &'a str) -> &'a str"],
          ["Method with &self, returns &", "No — elided (tied to self)", "fn get(&self) -> &str"],
          ["Struct holding a &", "Yes — struct needs 'a", "struct Foo<'a> { x: &'a str }"],
          ["String literals", "Always 'static", "let s: &'static str = \"hi\""],
          ["Owned data (String, Vec)", "Never needed", "fn foo(s: String) -> String"],
        ]
      }
    ]
  },

  // ─── PART 2: SMART POINTERS ───
  {
    id: 3, part: 2, partLabel: "Smart Pointers",
    title: "Box<T> — Heap Allocation",
    emoji: "📦", tagline: "Put data on the heap, keep it simple",
    color: "#38BDF8",
    sections: [
      {
        type: "intro",
        content: `A **smart pointer** is a data structure that acts like a pointer but with extra capabilities — like automatic memory management, reference counting, or interior mutability.\n\nYou've already seen two smart pointers: \`String\` and \`Vec<T>\`. But Rust's standard library has dedicated ones:\n\n- **Box<T>** — allocates data on the heap; single owner\n- **Rc<T>** — multiple owners in a single thread\n- **RefCell<T>** — mutate through a shared reference\n- **Arc<T>** — multiple owners across threads (Series 2!)\n\nStart with **Box<T>** — the simplest one.`
      },
      {
        type: "analogy",
        title: "📦 The Analogy: Shipping Boxes",
        content: `Normally, when you hand something to someone, they hold it directly. A Box<T> is like putting it in a shipping box first. The box lives on the heap. You pass the box around, and when nobody holds the box anymore, the contents are automatically discarded.\n\nWhy use a box? Three reasons: the data is too big for the stack, you don't know the size at compile time, or you want to use trait objects.`
      },
      {
        type: "code",
        title: "Using Box<T>",
        explanation: "Box::new() moves data to the heap. You use it mostly like a regular value — Rust automatically dereferences it. When the Box goes out of scope, both the box and the data are dropped.",
        code: `fn main() {
    // Simple box — not very useful for an integer,
    // but illustrates the concept
    let b = Box::new(5);
    println!("b = {}", b); // Rust auto-derefs: prints 5

    // More realistic: large data you want on the heap
    let large_array = Box::new([0u8; 1_000_000]); // 1MB on heap
    println!("Allocated {} bytes on heap", large_array.len());

} // large_array dropped here — memory freed automatically

// KEY USE CASE: Recursive types
// This would be INVALID (infinite size):
// enum List { Cons(i32, List), Nil }

// Box makes it work — the size is known (pointer size)
#[derive(Debug)]
enum List {
    Cons(i32, Box<List>), // Box has a known, fixed size
    Nil,
}

fn build_list() {
    let list = List::Cons(1,
        Box::new(List::Cons(2,
            Box::new(List::Cons(3,
                Box::new(List::Nil))))));
    println!("{:?}", list);
}`
      },
      {
        type: "code",
        title: "Box with Trait Objects",
        explanation: "Box<dyn Trait> is the most common use of Box. It lets you store different concrete types in the same collection, as long as they implement the same trait. The 'dyn' means method dispatch happens at runtime.",
        code: `trait Draw {
    fn draw(&self) -> String;
    fn bounding_box(&self) -> (f64, f64);
}

struct Circle { radius: f64 }
struct Square { side: f64 }
struct Triangle { base: f64, height: f64 }

impl Draw for Circle {
    fn draw(&self) -> String { format!("Circle(r={})", self.radius) }
    fn bounding_box(&self) -> (f64, f64) { (self.radius*2.0, self.radius*2.0) }
}
impl Draw for Square {
    fn draw(&self) -> String { format!("Square(s={})", self.side) }
    fn bounding_box(&self) -> (f64, f64) { (self.side, self.side) }
}
impl Draw for Triangle {
    fn draw(&self) -> String { format!("Triangle(b={},h={})", self.base, self.height) }
    fn bounding_box(&self) -> (f64, f64) { (self.base, self.height) }
}

fn main() {
    // Different types in the same Vec — possible with Box<dyn Trait>
    let shapes: Vec<Box<dyn Draw>> = vec![
        Box::new(Circle { radius: 5.0 }),
        Box::new(Square { side: 3.0 }),
        Box::new(Triangle { base: 4.0, height: 6.0 }),
    ];

    for shape in &shapes {
        let (w, h) = shape.bounding_box();
        println!("{} — bbox: {}x{}", shape.draw(), w, h);
    }
}`
      }
    ]
  },
  {
    id: 4, part: 2, partLabel: "Smart Pointers",
    title: "Rc<T> & RefCell<T>",
    emoji: "🔗", tagline: "Shared ownership & interior mutability",
    color: "#38BDF8",
    sections: [
      {
        type: "intro",
        content: `Rust's ownership rules say: one owner at a time. But sometimes you genuinely need multiple parts of your program to share the same data. That's where **Rc<T>** comes in.\n\nAnd sometimes you need to mutate data that's behind a shared reference — which ownership normally forbids. That's **RefCell<T>**.\n\nThese two are the "escape hatches" from Rust's strictest rules — but you pay for the flexibility by moving some checks from compile time to runtime.`
      },
      {
        type: "code",
        title: "Rc<T> — Reference Counted Shared Ownership",
        explanation: "Rc stands for Reference Counted. It keeps track of how many owners (clones) exist. When the count drops to zero, the data is freed. Only for single-threaded use — for threads, use Arc<T>.",
        code: `use std::rc::Rc;

#[derive(Debug)]
struct Config {
    theme: String,
    font_size: u32,
}

fn main() {
    // Create an Rc — starts with reference count = 1
    let config = Rc::new(Config {
        theme: String::from("dark"),
        font_size: 14,
    });

    println!("Count: {}", Rc::strong_count(&config)); // 1

    // Clone the Rc — this does NOT copy the data!
    // It just increments the reference count.
    let config_a = Rc::clone(&config); // count = 2
    let config_b = Rc::clone(&config); // count = 3

    println!("Count: {}", Rc::strong_count(&config)); // 3
    println!("Theme from A: {}", config_a.theme);
    println!("Theme from B: {}", config_b.theme);

    drop(config_a); // count = 2
    println!("Count after drop: {}", Rc::strong_count(&config)); // 2

} // config_b and config both drop here — count = 0 — data freed
// All three views the SAME data in memory.`
      },
      {
        type: "code",
        title: "RefCell<T> — Interior Mutability",
        explanation: "RefCell<T> lets you mutate data even when you only have a shared (immutable) reference to it. It enforces Rust's borrowing rules at RUNTIME instead of compile time. If you break the rules, it panics.",
        code: `use std::cell::RefCell;

fn main() {
    // RefCell wraps a value
    let data = RefCell::new(vec![1, 2, 3]);

    // borrow() gives an immutable reference (like &)
    {
        let r = data.borrow();
        println!("Data: {:?}", *r); // [1, 2, 3]
    } // r released here

    // borrow_mut() gives a mutable reference (like &mut)
    {
        let mut w = data.borrow_mut();
        w.push(4);
        w.push(5);
    } // w released here

    println!("Modified: {:?}", data.borrow()); // [1, 2, 3, 4, 5]

    // Runtime panic example (don't do this):
    // let r1 = data.borrow();
    // let r2 = data.borrow_mut(); // PANIC! Already borrowed!
}

// THE POWER COMBO: Rc<RefCell<T>>
// Shared ownership AND mutation
use std::rc::Rc;
use std::cell::RefCell;

fn shared_mutation_example() {
    let shared = Rc::new(RefCell::new(0));

    let a = Rc::clone(&shared);
    let b = Rc::clone(&shared);

    *a.borrow_mut() += 10;
    *b.borrow_mut() += 5;

    println!("Final value: {}", shared.borrow()); // 15
}`
      },
      {
        type: "table",
        title: "📋 Smart Pointer Decision Guide",
        headers: ["Need", "Use", "Thread safe?"],
        rows: [
          ["Single owner, heap data", "Box<T>", "Yes"],
          ["Multiple owners, single thread", "Rc<T>", "No"],
          ["Multiple owners, multiple threads", "Arc<T>", "Yes"],
          ["Mutate through shared ref, single thread", "RefCell<T>", "No"],
          ["Mutate through shared ref, multi-thread", "Mutex<T>", "Yes"],
          ["Multiple owners + mutate, single thread", "Rc<RefCell<T>>", "No"],
          ["Multiple owners + mutate, multi-thread", "Arc<Mutex<T>>", "Yes"],
        ]
      }
    ]
  },

  // ─── PART 3: ASYNC / AWAIT ───
  {
    id: 5, part: 3, partLabel: "Async / Await",
    title: "Futures & the Async Model",
    emoji: "🌊", tagline: "Concurrency without threads",
    color: "#FB923C",
    sections: [
      {
        type: "intro",
        content: `You learned OS threads in Series 2. Threads are great for CPU-heavy parallel work, but they're expensive — each thread uses memory for its stack and has overhead from the OS scheduling it.\n\n**Async** is a different concurrency model: instead of many threads, you have ONE (or a few) threads handling MANY tasks. When a task is waiting (for network, disk, a timer), it yields control so other tasks can run. No thread is ever blocked sitting idle.\n\nThis is how modern web servers handle 100,000 simultaneous connections without 100,000 threads.`
      },
      {
        type: "analogy",
        title: "🌊 The Analogy: Async Chef vs Thread Chef",
        content: `**Thread model**: You hire one chef per customer. Each chef works on one order, waits at the oven while it bakes, then serves. 10,000 customers = 10,000 chefs standing around. Very expensive.\n\n**Async model**: One chef handles all orders. They put dish 1 in the oven, while it bakes they prep dish 2, while that simmers they plate dish 3. When the oven beeps, they go back to dish 1. Nobody waits — the chef is always doing something useful.\n\nThe "oven beep" is the runtime notifying: "your I/O operation is done, you can resume now."`
      },
      {
        type: "code",
        title: "Futures: The Core Concept",
        explanation: "An async fn returns a Future — a value that represents a computation that will complete later. Futures are lazy: they do nothing until you .await them or drive them with a runtime. The Future trait has one method: poll().",
        code: `// Under the hood, async fn returns a Future
// These two are equivalent:

// Version 1: async fn syntax
async fn fetch_number() -> i32 {
    42
}

// Version 2: what the compiler roughly generates
fn fetch_number_desugared() -> impl std::future::Future<Output = i32> {
    async { 42 }
}

// Futures are LAZY — this does nothing:
let future = fetch_number(); // No computation yet!

// You must .await to actually run it:
// let value = fetch_number().await; // Now it runs

// The Future trait (simplified):
trait Future {
    type Output;
    fn poll(&mut self, cx: &mut Context) -> Poll<Self::Output>;
}

enum Poll<T> {
    Ready(T),    // Computation is done, here's the value
    Pending,     // Not done yet, wake me when ready
}`
      },
      {
        type: "code",
        title: "async / await Syntax",
        explanation: "Mark a function with 'async' to make it return a Future. Use '.await' inside async functions to wait for other Futures. When you .await, the current task is suspended and the runtime can run other tasks.",
        code: `// You need a runtime to execute async code.
// Tokio is the most popular. Add to Cargo.toml:
// tokio = { version = "1", features = ["full"] }

use tokio::time::{sleep, Duration};

async fn step(name: &str, ms: u64) -> String {
    println!("{}: starting", name);
    sleep(Duration::from_millis(ms)).await; // yield here!
    println!("{}: done", name);
    format!("{} result", name)
}

#[tokio::main]
async fn main() {
    // Sequential: runs one at a time (~600ms total)
    let a = step("A", 300).await;
    let b = step("B", 200).await;
    let c = step("C", 100).await;
    println!("{}, {}, {}", a, b, c);

    // Concurrent with join!: all run at once (~300ms total)
    let (a, b, c) = tokio::join!(
        step("A", 300),
        step("B", 200),
        step("C", 100),
    );
    println!("{}, {}, {}", a, b, c);
}`
      },
      {
        type: "code",
        title: "async Error Handling",
        explanation: "Async functions combine naturally with Result and the ? operator. An async function can return Result<T, E> and use ? inside it, just like regular functions.",
        code: `use std::fmt;

#[derive(Debug)]
enum AppError {
    Network(String),
    Parse(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::Network(e) => write!(f, "Network error: {}", e),
            AppError::Parse(e)   => write!(f, "Parse error: {}", e),
        }
    }
}

async fn fetch_data(url: &str) -> Result<String, AppError> {
    if url.is_empty() {
        return Err(AppError::Network("Empty URL".into()));
    }
    // Simulate async work...
    Ok(format!("Data from {}", url))
}

async fn parse_data(data: String) -> Result<i32, AppError> {
    data.len().to_string().parse::<i32>()
        .map_err(|e| AppError::Parse(e.to_string()))
}

async fn pipeline(url: &str) -> Result<i32, AppError> {
    let data = fetch_data(url).await?;  // ? works in async!
    let parsed = parse_data(data).await?;
    Ok(parsed)
}

#[tokio::main]
async fn main() {
    match pipeline("https://example.com").await {
        Ok(v) => println!("Success: {}", v),
        Err(e) => println!("Error: {}", e),
    }
}`
      }
    ]
  },
  {
    id: 6, part: 3, partLabel: "Async / Await",
    title: "Async Deep Dive",
    emoji: "🔬", tagline: "Tasks, spawning, and async patterns",
    color: "#FB923C",
    sections: [
      {
        type: "intro",
        content: `Now that you understand the basics, let's go deeper into async Rust patterns. Two key concepts:\n\n- **Tasks** are async Rust's version of threads — lightweight, managed by the runtime, can be spawned in huge numbers\n- **Select** lets you wait on multiple futures and react to whichever finishes first\n\nThese patterns power real-world async code like web servers and network clients.`
      },
      {
        type: "code",
        title: "Spawning Async Tasks",
        explanation: "tokio::spawn() creates a lightweight task — like a thread, but much cheaper. Thousands of tasks can run on just a few OS threads. The runtime schedules them efficiently.",
        code: `use tokio::task;
use tokio::time::{sleep, Duration};

async fn worker(id: u32) -> u32 {
    sleep(Duration::from_millis(100)).await;
    println!("Worker {} done", id);
    id * id // return the square
}

#[tokio::main]
async fn main() {
    // Spawn 10 tasks — all run concurrently
    let mut handles = vec![];

    for i in 1..=10 {
        let handle = task::spawn(worker(i)); // non-blocking spawn
        handles.push(handle);
    }

    // Collect all results
    let mut results = vec![];
    for handle in handles {
        let result = handle.await.unwrap(); // wait for each task
        results.push(result);
    }

    println!("Results: {:?}", results);
    // All 10 tasks ran concurrently, total time ~100ms not ~1000ms

    // spawn_blocking: run CPU-heavy work without blocking the runtime
    let result = task::spawn_blocking(|| {
        // This runs in a thread pool, not blocking async tasks
        (1..=1000u64).sum::<u64>()
    }).await.unwrap();

    println!("Sum: {}", result); // 500500
}`
      },
      {
        type: "code",
        title: "select! — Race Multiple Futures",
        explanation: "tokio::select! waits on multiple futures simultaneously and runs the branch of whichever completes FIRST. Cancels the other futures. Great for timeouts and racing alternatives.",
        code: `use tokio::time::{sleep, Duration};
use tokio::sync::oneshot;

async fn slow_operation() -> &'static str {
    sleep(Duration::from_millis(500)).await;
    "slow result"
}

async fn fast_operation() -> &'static str {
    sleep(Duration::from_millis(100)).await;
    "fast result"
}

#[tokio::main]
async fn main() {
    // select!: run whichever finishes first
    let winner = tokio::select! {
        result = slow_operation() => result,
        result = fast_operation() => result,
    };
    println!("Winner: {}", winner); // "fast result"

    // Timeout pattern — very common!
    let result = tokio::select! {
        val = slow_operation() => Ok(val),
        _ = sleep(Duration::from_millis(200)) => Err("timeout!"),
    };

    match result {
        Ok(val) => println!("Got: {}", val),
        Err(e)  => println!("Error: {}", e), // "timeout!"
    }

    // Channels in async context
    let (tx, rx) = oneshot::channel::<String>();

    tokio::spawn(async move {
        sleep(Duration::from_millis(50)).await;
        tx.send(String::from("async message")).unwrap();
    });

    println!("{}", rx.await.unwrap()); // "async message"
}`
      },
      {
        type: "table",
        title: "📋 Threads vs Async — When to Use Which",
        headers: ["Scenario", "Best Choice", "Why"],
        rows: [
          ["CPU-heavy computation", "OS Threads", "Async can't parallelize CPU work"],
          ["Many network connections", "Async Tasks", "Cheap, no blocking"],
          ["File I/O, database calls", "Async Tasks", "Wait time, not CPU time"],
          ["Simple background job", "OS Thread", "Simpler code"],
          ["Web server", "Async (Tokio)", "Handle 10k+ connections"],
          ["Parallel number crunching", "Rayon (thread pool)", "Data parallelism"],
          ["Mix of both", "spawn_blocking()", "Run CPU work from async"],
        ]
      }
    ]
  },

  // ─── PART 4: MACROS ───
  {
    id: 7, part: 4, partLabel: "Macros",
    title: "Declarative Macros",
    emoji: "🧙", tagline: "Code that writes code",
    color: "#4ADE80",
    sections: [
      {
        type: "intro",
        content: `Macros are one of Rust's most powerful features. You've been using them all along: \`println!\`, \`vec!\`, \`assert!\` are all macros.\n\nA **macro** is code that generates code at compile time. There are two types:\n\n- **Declarative macros** (\`macro_rules!\`) — pattern matching on syntax, like a match expression for code\n- **Procedural macros** — functions that take a token stream and output a token stream (more advanced)\n\nMacros can do things functions cannot: accept variable numbers of arguments, different types, or generate new code patterns.`
      },
      {
        type: "analogy",
        title: "🧙 The Analogy: A Code Template",
        content: `Imagine a fill-in-the-blank template: "Dear [NAME], I am writing to [PURPOSE]." You fill in NAME and PURPOSE and get a complete letter. Macros work similarly — they're templates for code. You call a macro with some inputs, and it expands into full Rust code before compilation.\n\nThe key difference from functions: macros run at COMPILE time, not runtime. The expanded code is what actually gets compiled.`
      },
      {
        type: "code",
        title: "Writing Your First Macro",
        explanation: "macro_rules! defines a declarative macro. It works like match: each 'arm' has a pattern and a template. The pattern matches the macro's arguments, the template is what it expands to.",
        code: `// Define a macro
macro_rules! say_hello {
    // Pattern: no arguments
    () => {
        println!("Hello, world!");
    };
    // Pattern: one expression argument
    ($name:expr) => {
        println!("Hello, {}!", $name);
    };
}

// A macro that creates a vector — like the built-in vec![]
macro_rules! my_vec {
    // Match zero or more expressions separated by commas
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}

fn main() {
    say_hello!();           // Hello, world!
    say_hello!("Rustacean"); // Hello, Rustacean!

    let v = my_vec![1, 2, 3, 4, 5];
    println!("{:?}", v); // [1, 2, 3, 4, 5]
}`
      },
      {
        type: "code",
        title: "Practical Macro Examples",
        explanation: "Here are patterns you'll actually use. Macros shine when you need variable argument counts, or want to reduce repetitive boilerplate code.",
        code: `// Macro for creating HashMaps with initial values
macro_rules! hashmap {
    ( $( $key:expr => $val:expr ),* ) => {
        {
            let mut map = std::collections::HashMap::new();
            $( map.insert($key, $val); )*
            map
        }
    };
}

// Macro for assertions with custom messages
macro_rules! assert_between {
    ($val:expr, $min:expr, $max:expr) => {
        assert!(
            $val >= $min && $val <= $max,
            "{} is not between {} and {}",
            $val, $min, $max
        );
    };
}

// Logging macro that includes file/line info
macro_rules! log_info {
    ($($arg:tt)*) => {
        println!("[INFO {}:{}] {}", file!(), line!(), format!($($arg)*));
    };
}

fn main() {
    let scores = hashmap![
        "Alice" => 95,
        "Bob"   => 87,
        "Carol" => 92
    ];
    println!("{:?}", scores);

    let temperature = 22;
    assert_between!(temperature, 0, 40); // Passes

    log_info!("Processing {} items", 42);
    // [INFO src/main.rs:31] Processing 42 items
}`
      },
      {
        type: "code",
        title: "Macro Fragment Specifiers",
        explanation: "When matching patterns, you specify what KIND of syntax each argument is. These are called fragment specifiers — they tell the macro parser what to expect.",
        code: `// Fragment specifiers:
// $x:expr   — an expression (5+3, "hello", some_fn())
// $x:ident  — an identifier (variable/function name)
// $x:ty     — a type (i32, String, Vec<u8>)
// $x:stmt   — a statement
// $x:block  — a block { ... }
// $x:pat    — a pattern (used in match arms)
// $x:tt     — a single token tree (very flexible)
// $( )* — repeat zero or more times
// $( ),* — repeat with comma separator
// $( );* — repeat with semicolon separator

// Example using multiple specifier types:
macro_rules! make_function {
    ($name:ident, $return_type:ty, $body:block) => {
        fn $name() -> $return_type $body
    };
}

make_function!(get_greeting, String, {
    String::from("Hello, Rustaceans!")
});

make_function!(get_answer, i32, {
    42
});

fn main() {
    println!("{}", get_greeting()); // Hello, Rustaceans!
    println!("{}", get_answer());   // 42
}`
      }
    ]
  },
  {
    id: 8, part: 4, partLabel: "Macros",
    title: "Procedural Macros & #[derive]",
    emoji: "⚗️", tagline: "The magic behind #[derive]",
    color: "#4ADE80",
    sections: [
      {
        type: "intro",
        content: `You've been using procedural macros all along — every time you write \`#[derive(Debug)]\` or \`#[tokio::main]\`.\n\n**Procedural macros** are Rust functions that take a stream of tokens as input and produce a stream of tokens as output. They're more powerful than \`macro_rules!\` but also more complex to write.\n\nThere are three types:\n- **Custom derive** — add behavior with \`#[derive(YourMacro)]\`\n- **Attribute macros** — transform items with \`#[your_attribute]\`\n- **Function-like macros** — look like \`your_macro!(...)\` but are more powerful\n\nWe'll focus on understanding how they work, since writing them requires a separate crate.`
      },
      {
        type: "code",
        title: "What #[derive] Does",
        explanation: "derive is a procedural macro that reads your struct/enum definition and generates trait implementations automatically. Understanding what it generates helps you understand traits more deeply.",
        code: `// When you write this:
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

// Rust generates ROUGHLY this:

impl std::fmt::Debug for Point {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        f.debug_struct("Point")
            .field("x", &self.x)
            .field("y", &self.y)
            .finish()
    }
}

impl Clone for Point {
    fn clone(&self) -> Self {
        Point { x: self.x.clone(), y: self.y.clone() }
    }
}

impl PartialEq for Point {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y
    }
}

fn main() {
    let p1 = Point { x: 1.0, y: 2.0 };
    let p2 = p1.clone();
    println!("{:?}", p1);      // Point { x: 1.0, y: 2.0 }
    println!("Equal: {}", p1 == p2); // true
}`
      },
      {
        type: "code",
        title: "Built-in Attribute Macros",
        explanation: "Even without writing your own procedural macros, you'll use many built-in ones. These transform your code in powerful ways.",
        code: `// #[cfg] — conditional compilation
#[cfg(debug_assertions)]
fn debug_only() {
    println!("This function only exists in debug builds!");
}

#[cfg(target_os = "linux")]
fn linux_only() {
    println!("Linux-specific code");
}

// #[test] — mark a function as a test
#[test]
fn my_test() {
    assert_eq!(2 + 2, 4);
}

// #[allow] / #[warn] / #[deny] — control lints
#[allow(dead_code)]
fn unused_function() {} // Compiler won't warn about this

// #[inline] — hint to compiler to inline this function
#[inline]
fn small_function(x: i32) -> i32 { x * 2 }

// #[deprecated] — warn users their code needs updating
#[deprecated(since = "2.0.0", note = "Use new_function() instead")]
fn old_function() {}

// #[derive] with external crates (very common in real projects)
// serde = { version = "1", features = ["derive"] }
// #[derive(Serialize, Deserialize)]
// struct Config { name: String, value: i32 }
// This auto-generates JSON serialization code!`
      }
    ]
  },

  // ─── PART 5: TESTING ───
  {
    id: 9, part: 5, partLabel: "Testing",
    title: "Unit Tests",
    emoji: "🧪", tagline: "Proving your code works",
    color: "#F472B6",
    sections: [
      {
        type: "intro",
        content: `Rust has testing built into the language — no extra test framework needed. Tests are just functions annotated with \`#[test]\`. Run them all with \`cargo test\`.\n\nThere are three kinds of tests:\n- **Unit tests** — test individual functions in the same file\n- **Integration tests** — test your library from the outside (in a \`tests/\` folder)\n- **Doc tests** — code examples in your documentation that are also run as tests\n\nGood tests are the safety net that lets you refactor confidently.`
      },
      {
        type: "analogy",
        title: "🧪 The Analogy: Quality Control",
        content: `Imagine a factory producing widgets. Quality control (tests) checks each widget after it's made. If a widget fails inspection, you know immediately which step broke — before any faulty widgets reach customers.\n\nRust tests work the same way: you write assertions about what your code SHOULD do. When you change something and a test fails, you know exactly what broke — before it reaches production.`
      },
      {
        type: "code",
        title: "Writing Unit Tests",
        explanation: "Unit tests live in a 'tests' module inside the same file, marked with #[cfg(test)] so they only compile during testing. Each test function is marked with #[test].",
        code: `fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn is_even(n: i32) -> bool {
    n % 2 == 0
}

fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("Cannot divide by zero"))
    } else {
        Ok(a / b)
    }
}

// Test module — only compiled with 'cargo test'
#[cfg(test)]
mod tests {
    use super::*; // Import everything from parent module

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
        assert_eq!(add(0, 0), 0);
    }

    #[test]
    fn test_is_even() {
        assert!(is_even(4));
        assert!(!is_even(3));
        assert!(is_even(0));
        assert!(!is_even(-1));
    }

    #[test]
    fn test_divide_ok() {
        let result = divide(10.0, 2.0);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 5.0);
    }

    #[test]
    fn test_divide_by_zero() {
        let result = divide(10.0, 0.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Cannot divide by zero");
    }

    #[test]
    #[should_panic] // This test PASSES if the code panics
    fn test_panic() {
        let v: Vec<i32> = vec![];
        let _ = v[0]; // Should panic: index out of bounds
    }
}`
      },
      {
        type: "code",
        title: "Test Assertions Toolkit",
        explanation: "Rust provides several assertion macros for different situations. Choosing the right one gives you clearer error messages when tests fail.",
        code: `#[cfg(test)]
mod tests {
    #[test]
    fn assertions_demo() {
        // assert! — checks that a condition is true
        assert!(2 + 2 == 4);
        assert!(!"hello".is_empty(), "String should not be empty");

        // assert_eq! — checks equality (gives better error messages)
        assert_eq!(2 + 2, 4);
        assert_eq!("hello".len(), 5);

        // assert_ne! — checks inequality
        assert_ne!(2 + 2, 5);

        // Custom message (works with all assert macros)
        let x = 10;
        assert!(
            x > 5,
            "Expected x > 5, but x was {}", x
        );

        // Approximate float equality
        let result = 0.1 + 0.2;
        assert!((result - 0.3).abs() < 1e-10,
            "Float precision issue: {}", result);
    }

    #[test]
    #[ignore] // Skip this test (run with: cargo test -- --ignored)
    fn expensive_test() {
        // This takes too long to run normally
    }

    // Run specific tests: cargo test test_name
    // Run with output:   cargo test -- --nocapture
    // List all tests:    cargo test -- --list
}`
      }
    ]
  },
  {
    id: 10, part: 5, partLabel: "Testing",
    title: "Integration & Doc Tests",
    emoji: "📋", tagline: "Testing from the outside",
    color: "#F472B6",
    sections: [
      {
        type: "intro",
        content: `Unit tests verify individual functions in isolation. **Integration tests** verify that multiple parts work together correctly — they test your library's public API from an external perspective.\n\n**Doc tests** are a uniquely Rust idea: code examples in your documentation are automatically compiled and run as tests. This guarantees your docs are never out of date.`
      },
      {
        type: "code",
        title: "Integration Tests",
        explanation: "Integration tests live in a 'tests/' directory at the root of your project. Each file is a separate test crate. They can only access public API — just like a real user of your library would.",
        code: `// File: src/lib.rs (your library)
pub fn add(a: i32, b: i32) -> i32 { a + b }
pub fn multiply(a: i32, b: i32) -> i32 { a * b }

pub fn quadratic(a: f64, b: f64, c: f64) -> Option<(f64, f64)> {
    let discriminant = b * b - 4.0 * a * c;
    if discriminant < 0.0 {
        None // No real roots
    } else {
        let sqrt_d = discriminant.sqrt();
        Some(((-b + sqrt_d) / (2.0 * a),
              (-b - sqrt_d) / (2.0 * a)))
    }
}

// ─────────────────────────────────────────────
// File: tests/integration_test.rs
// ─────────────────────────────────────────────
// use my_crate::{add, multiply, quadratic};
//
// #[test]
// fn test_arithmetic() {
//     assert_eq!(add(2, 3), 5);
//     assert_eq!(multiply(4, 5), 20);
//     assert_eq!(add(multiply(2, 3), multiply(3, 4)), 18);
// }
//
// #[test]
// fn test_quadratic_real_roots() {
//     let result = quadratic(1.0, -5.0, 6.0);
//     assert!(result.is_some());
//     let (r1, r2) = result.unwrap();
//     assert!((r1 - 3.0).abs() < 1e-10);
//     assert!((r2 - 2.0).abs() < 1e-10);
// }
//
// #[test]
// fn test_quadratic_no_roots() {
//     assert!(quadratic(1.0, 0.0, 1.0).is_none());
// }`
      },
      {
        type: "code",
        title: "Doc Tests — Living Documentation",
        explanation: "Any code block in a /// doc comment is automatically run as a test with 'cargo test'. This means your examples are always correct — they can't go stale.",
        code: [
          "/// Adds two numbers together.",
          "///",
          "/// # Examples",
          "///",
          "/// ```",
          "/// let result = my_crate::add(2, 3);",
          "/// assert_eq!(result, 5);",
          "/// ```",
          "///",
          "/// Works with negative numbers too:",
          "///",
          "/// ```",
          "/// assert_eq!(my_crate::add(-1, 1), 0);",
          "/// ```",
          "pub fn add(a: i32, b: i32) -> i32 { a + b }",
          "",
          "/// Returns the square root, or None if negative.",
          "///",
          "/// # Examples",
          "///",
          "/// ```",
          "/// assert_eq!(my_crate::safe_sqrt(4.0), Some(2.0));",
          "/// assert_eq!(my_crate::safe_sqrt(-1.0), None);",
          "/// ```",
          "pub fn safe_sqrt(x: f64) -> Option<f64> {",
          "    if x < 0.0 { None } else { Some(x.sqrt()) }",
          "}",
          "",
          "// cargo test will:",
          "// 1. Run all #[test] unit tests",
          "// 2. Run all tests/ integration tests",
          "// 3. Compile and run all ``` code blocks in doc comments",
          "// If ANY example in your docs is wrong, cargo test fails!",
        ].join("\n")
      },
      {
        type: "table",
        title: "📋 Testing Cheat Sheet",
        headers: ["Command", "What it does"],
        rows: [
          ["cargo test", "Run all tests (unit + integration + doc)"],
          ["cargo test my_fn", "Run only tests containing 'my_fn' in their name"],
          ["cargo test -- --nocapture", "Show println! output even for passing tests"],
          ["cargo test -- --ignored", "Run tests marked with #[ignore]"],
          ["cargo test -- --list", "List all test names without running them"],
          ["cargo doc --open", "Build and open your documentation"],
          ["cargo doc --no-deps", "Build docs without dependency docs"],
        ]
      }
    ]
  },

  // ─── SERIES WRAP UP ───
  {
    id: 11, part: 6, partLabel: "Wrap Up",
    title: "You're Now Advanced! 🎓",
    emoji: "🏆", tagline: "What you've mastered across all three series",
    color: "#FACC15",
    sections: [
      {
        type: "intro",
        content: `You've covered an enormous amount of ground. Let's take stock of the full journey — from zero to advanced Rust.`
      },
      {
        type: "table",
        title: "🗺️ Your Complete Rust Journey",
        headers: ["Series", "Topics Mastered"],
        rows: [
          ["Series 1 (Beginner)", "Variables, types, functions, ownership & borrowing, control flow, structs, enums, error handling"],
          ["Series 2 (Intermediate)", "Traits, generics, trait objects, Vec/HashMap/HashSet, iterators, closures, threads, Mutex, Arc"],
          ["Series 3 (Advanced)", "Lifetimes, Box/Rc/RefCell, async/await, Futures, tasks, declarative macros, proc macros, unit/integration/doc tests"],
        ]
      },
      {
        type: "analogy",
        title: "🚀 What to Build Next",
        content: `Now that you have strong conceptual foundations, the best way to grow is to BUILD things. Some ideas by difficulty:\n\n**Beginner projects**: Calculator CLI, number guessing game, file word counter\n\n**Intermediate projects**: Todo app CLI, Markdown parser, simple key-value store, JSON formatter\n\n**Advanced projects**: HTTP client from scratch, async chat server, database connection pool, custom allocator\n\n**Community & Resources**:\n• **The Rustonomicon** (doc.rust-lang.org/nomicon) — unsafe Rust internals\n• **Rust Design Patterns** (rust-unofficial.github.io/patterns)\n• **Jon Gjengset's YouTube** — advanced Rust live-coding\n• **This Week in Rust** — weekly newsletter\n• **crates.io** — explore the ecosystem: serde, tokio, axum, clap, rayon\n\nYou are officially a Rustacean. 🦀 The compiler is your friend. Embrace it!`
      }
    ]
  }
];

const parts = [
  { id: 1, label: "Lifetimes", color: "#C084FC", emoji: "⏳" },
  { id: 2, label: "Smart Pointers", color: "#38BDF8", emoji: "📦" },
  { id: 3, label: "Async/Await", color: "#FB923C", emoji: "🌊" },
  { id: 4, label: "Macros", color: "#4ADE80", emoji: "🧙" },
  { id: 5, label: "Testing", color: "#F472B6", emoji: "🧪" },
  { id: 6, label: "Wrap Up", color: "#FACC15", emoji: "🏆" },
];

export default function RustSeries3TutorialContent() {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Set<number>>(
    () => new Set()
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePart, setActivePart] = useState<number | null>(null);

  const chapter = chapters[currentChapter];
  const filteredChapters =
    activePart === null
      ? chapters
      : chapters.filter((item) => item.part === activePart);
  const progress = Math.round((completedChapters.size / chapters.length) * 100);

  const selectPart = (partId: number | null) => {
    setActivePart(partId);
    if (partId === null) {
      return;
    }

    const nextIndex = chapters.findIndex((item) => item.part === partId);
    if (nextIndex >= 0) {
      setCurrentChapter(nextIndex);
    }
  };

  const markComplete = () => {
    setCompletedChapters((prev) => new Set(prev).add(currentChapter));
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-950/50 shadow-2xl shadow-black/30">
      <div className="border-b border-white/10 bg-gradient-to-r from-violet-400/10 via-sky-400/10 via-orange-400/10 to-yellow-400/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-100/65">
              Rust continuation
            </p>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white md:text-3xl">
                Series 3: Advanced Rust
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-blue-100/80 md:text-base">
                This continues the intermediate Rust tutorial with lifetimes,
                smart pointers, async internals, macros, testing, and
                practical next steps for real backend work.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {parts.map((part) => (
              <span
                key={part.id}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-blue-100/85"
              >
                {part.emoji} {part.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:min-h-[58rem]">
        <aside
          className={`border-b border-white/10 bg-slate-950/55 backdrop-blur-xl transition-all duration-300 lg:border-b-0 lg:border-r ${
            sidebarOpen ? "lg:w-80" : "lg:w-20"
          }`}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm text-blue-100 transition hover:border-white/20 hover:bg-white/10"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            {sidebarOpen ? (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Rust Series 3</p>
                <p className="text-xs text-blue-100/60">
                  {chapters.length} chapters, {parts.length} focused parts
                </p>
              </div>
            ) : null}
          </div>

          {sidebarOpen ? (
            <>
              <div className="border-b border-white/10 px-4 py-4">
                <div className="mb-2 flex items-center justify-between text-xs text-blue-100/65">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 via-sky-400 via-orange-400 via-emerald-400 via-pink-400 to-yellow-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-blue-100/55">
                  {completedChapters.size} of {chapters.length} chapters completed
                </p>
              </div>

              <div className="border-b border-white/10 px-4 py-4">
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-blue-100/55">
                  Focus area
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => selectPart(null)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      activePart === null
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-blue-100/70 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    All parts
                  </button>
                  {parts.map((part) => (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => selectPart(activePart === part.id ? null : part.id)}
                      className="rounded-full border px-3 py-1.5 text-xs transition"
                      style={{
                        borderColor:
                          activePart === part.id
                            ? `${part.color}66`
                            : "rgba(255,255,255,0.1)",
                        background:
                          activePart === part.id
                            ? `${part.color}22`
                            : "rgba(255,255,255,0.04)",
                        color:
                          activePart === part.id
                            ? part.color
                            : "rgba(191,219,254,0.75)",
                      }}
                    >
                      {part.emoji} Part {part.id}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="max-h-[28rem] overflow-y-auto p-3 lg:max-h-none lg:flex-1">
            {(sidebarOpen ? filteredChapters : chapters).map((item) => {
              const chapterIndex = chapters.indexOf(item);
              const isActive = chapterIndex === currentChapter;
              const isCompleted = completedChapters.has(chapterIndex);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentChapter(chapterIndex)}
                  className="mb-2 flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition"
                  style={{
                    borderColor: isActive
                      ? `${item.color}55`
                      : "rgba(255,255,255,0.06)",
                    background: isActive
                      ? `${item.color}1a`
                      : "rgba(255,255,255,0.03)",
                    color: isActive ? "#ffffff" : "rgba(191,219,254,0.8)",
                  }}
                >
                  <span className="text-lg">{item.emoji}</span>
                  {sidebarOpen ? (
                    <span className="min-w-0 flex-1">
                      <span
                        className="block text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: `${item.color}cc` }}
                      >
                        Part {item.part}
                      </span>
                      <span className="mt-1 block truncate text-sm font-medium">
                        {item.title}
                      </span>
                    </span>
                  ) : null}
                  {sidebarOpen && isCompleted ? (
                    <span className="text-xs text-emerald-300">✓</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header
            className="border-b border-white/10 px-5 py-6 md:px-8"
            style={{
              background: `linear-gradient(135deg, ${chapter.color}16 0%, rgba(15,23,42,0) 65%)`,
            }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-blue-100/65">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Part {chapter.part}: {chapter.partLabel}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Chapter {chapter.id} of {chapters.length}
              </span>
              {completedChapters.has(currentChapter) ? (
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                  Completed
                </span>
              ) : null}
            </div>
            <div className="space-y-2">
              <h4
                className="text-2xl font-semibold md:text-3xl"
                style={{ color: chapter.color }}
              >
                {chapter.emoji} {chapter.title}
              </h4>
              <p className="text-sm italic text-blue-100/70 md:text-base">
                {chapter.tagline}
              </p>
            </div>
          </header>

          <div className="space-y-8 px-5 py-6 md:px-8 md:py-8">
            {chapter.sections.map((section, index) => (
              <SectionBlock
                key={`${chapter.id}-${index}`}
                section={section}
                accentColor={chapter.color}
              />
            ))}

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setCurrentChapter((prev) => Math.max(0, prev - 1))}
                disabled={currentChapter === 0}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:border-white/25 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-blue-100/35"
              >
                Previous chapter
              </button>

              <p className="text-center text-sm text-blue-100/60">
                {currentChapter + 1} / {chapters.length}
              </p>

              <button
                type="button"
                onClick={markComplete}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg transition hover:brightness-110"
                style={{
                  background: completedChapters.has(currentChapter)
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : `linear-gradient(135deg, ${chapter.color}, ${chapter.color}cc)`,
                }}
              >
                {completedChapters.has(currentChapter)
                  ? currentChapter < chapters.length - 1
                    ? "Next chapter"
                    : "Tutorial complete"
                  : currentChapter < chapters.length - 1
                    ? "Mark complete and continue"
                    : "Finish Series 3"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SectionBlock({
  section,
  accentColor,
}: {
  section: TutorialSection;
  accentColor: string;
}) {
  if (section.type === "intro") {
    return (
      <section className="space-y-3 text-sm leading-7 text-white/85 md:text-base">
        {renderStructuredText(section.content, accentColor)}
      </section>
    );
  }

  if (section.type === "analogy") {
    return (
      <section
        className="rounded-2xl border p-5 md:p-6"
        style={{
          borderColor: `${accentColor}40`,
          background: `linear-gradient(135deg, ${accentColor}18 0%, rgba(15,23,42,0.6) 100%)`,
        }}
      >
        <h5
          className="mb-3 text-base font-semibold md:text-lg"
          style={{ color: accentColor }}
        >
          {section.title}
        </h5>
        <div className="space-y-3 text-sm leading-7 text-white/85 md:text-base">
          {section.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{renderInlineText(paragraph, accentColor)}</p>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === "code") {
    return (
      <CodeBlock
        title={section.title}
        explanation={section.explanation}
        code={section.code}
        accentColor={accentColor}
      />
    );
  }

  return (
    <section className="space-y-4">
      <h5
        className="text-base font-semibold md:text-lg"
        style={{ color: accentColor }}
      >
        {section.title}
      </h5>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-950/80">
              <tr>
                {section.headers.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-xs uppercase tracking-[0.18em]"
                    style={{ color: accentColor }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, rowIndex) => (
                <tr
                  key={`${section.title}-${rowIndex}`}
                  className="border-t border-white/10 odd:bg-white/[0.02]"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${cell}-${cellIndex}`}
                      className={`px-4 py-3 align-top ${
                        cellIndex === 0
                          ? "font-mono text-xs md:text-sm"
                          : "text-white/80"
                      }`}
                      style={cellIndex === 0 ? { color: accentColor } : undefined}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CodeBlock({
  title,
  explanation,
  code,
  accentColor,
}: {
  title: string;
  explanation?: string;
  code: string;
  accentColor: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <h5
          className="text-base font-semibold md:text-lg"
          style={{ color: accentColor }}
        >
          {title}
        </h5>
        {explanation ? (
          <p className="text-sm leading-7 text-white/80">
            {renderInlineText(explanation, accentColor)}
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3">
          <span className="font-mono text-xs tracking-[0.18em] text-blue-100/45">
            main.rs
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-blue-100/75 transition hover:border-white/20 hover:bg-white/10"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-xs leading-7 text-slate-100 md:px-5 md:text-sm">
          <code>
            <RustHighlight code={code} accentColor={accentColor} />
          </code>
        </pre>
      </div>
    </section>
  );
}

function renderStructuredText(text: string, accentColor: string) {
  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={`spacer-${index}`} className="h-2" />;
    }

    if (trimmed.startsWith("- ")) {
      return (
        <div key={`bullet-${index}`} className="flex gap-3">
          <span className="mt-1" style={{ color: accentColor }}>
            ▸
          </span>
          <p className="flex-1">{renderInlineText(trimmed.slice(2), accentColor)}</p>
        </div>
      );
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      return (
        <div key={`number-${index}`} className="flex gap-3">
          <span className="mt-0.5 font-semibold" style={{ color: accentColor }}>
            {numberedMatch[1]}.
          </span>
          <p className="flex-1">
            {renderInlineText(numberedMatch[2], accentColor)}
          </p>
        </div>
      );
    }

    return <p key={`paragraph-${index}`}>{renderInlineText(trimmed, accentColor)}</p>;
  });
}

function renderInlineText(text: string, accentColor: string): ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} style={{ color: accentColor }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.92em]"
          style={{ color: accentColor }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function RustHighlight({
  code,
  accentColor,
}: {
  code: string;
  accentColor: string;
}) {
  const keywords = new Set([
    "async",
    "await",
    "break",
    "const",
    "continue",
    "dyn",
    "else",
    "enum",
    "Err",
    "false",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "match",
    "mod",
    "move",
    "mut",
    "None",
    "Ok",
    "pub",
    "return",
    "self",
    "Self",
    "Some",
    "static",
    "struct",
    "trait",
    "true",
    "type",
    "unsafe",
    "use",
    "where",
    "while",
    "extern",
    "ref",
    "super",
    "crate",
  ]);
  const primitiveTypes = new Set([
    "bool",
    "char",
    "f32",
    "f64",
    "i16",
    "i32",
    "i64",
    "i8",
    "i128",
    "isize",
    "str",
    "u16",
    "u32",
    "u64",
    "u8",
    "u128",
    "usize",
    "String",
    "Option",
    "Result",
    "Vec",
    "Box",
    "Rc",
    "Arc",
    "Mutex",
    "RefCell",
    "Future",
    "Poll",
    "Context",
  ]);

  const tokens: ReactNode[] = [];
  let remaining = code;
  let index = 0;

  while (remaining.length > 0) {
    if (remaining.startsWith("//")) {
      const lineEnd = remaining.indexOf("\n");
      const comment = lineEnd === -1 ? remaining : remaining.slice(0, lineEnd);
      tokens.push(
        <span key={index++} className="text-slate-500">
          {comment}
        </span>
      );
      remaining = lineEnd === -1 ? "" : remaining.slice(lineEnd);
      continue;
    }

    if (remaining[0] === '"') {
      let cursor = 1;
      while (cursor < remaining.length) {
        if (remaining[cursor] === "\\") {
          cursor += 2;
          continue;
        }
        if (remaining[cursor] === '"') {
          cursor += 1;
          break;
        }
        cursor += 1;
      }

      tokens.push(
        <span key={index++} className="text-sky-200">
          {remaining.slice(0, cursor)}
        </span>
      );
      remaining = remaining.slice(cursor);
      continue;
    }

    const macroMatch = remaining.match(/^([a-z_][a-z0-9_]*)!/i);
    if (macroMatch) {
      tokens.push(
        <span key={index++} className="text-amber-300">
          {macroMatch[0]}
        </span>
      );
      remaining = remaining.slice(macroMatch[0].length);
      continue;
    }

    const wordMatch = remaining.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (wordMatch) {
      const word = wordMatch[0];
      let className = "text-slate-100";
      let style: { color?: string } | undefined;

      if (keywords.has(word)) {
        className = "text-rose-300";
      } else if (primitiveTypes.has(word)) {
        className = "text-amber-300";
      } else if (/^[A-Z]/.test(word)) {
        style = { color: accentColor };
      }

      tokens.push(
        <span key={index++} className={className} style={style}>
          {word}
        </span>
      );
      remaining = remaining.slice(word.length);
      continue;
    }

    const numberMatch = remaining.match(/^[0-9][0-9_.]*/);
    if (numberMatch) {
      tokens.push(
        <span key={index++} className="text-cyan-300">
          {numberMatch[0]}
        </span>
      );
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    tokens.push(<span key={index++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{tokens}</>;
}
