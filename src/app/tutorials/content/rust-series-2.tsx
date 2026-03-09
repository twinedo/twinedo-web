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

const parts = [
  { id: 1, label: "Traits & Generics", color: "#10b981", emoji: "🎭" },
  { id: 2, label: "Collections & Iterators", color: "#f59e0b", emoji: "📚" },
  { id: 3, label: "Concurrency & Threads", color: "#f97316", emoji: "⚡" },
];

const chapters: Chapter[] = [
  {
    id: 1,
    part: 1,
    partLabel: "Traits & Generics",
    title: "Traits: Shared Behavior",
    emoji: "🎭",
    tagline: "Define what types can do",
    color: "#10b981",
    sections: [
      {
        type: "intro",
        content:
          "You've already used traits without knowing it, when you called `.len()` on a `String`, or used `println!` with `{}`, those work because of traits under the hood.\n\nA **trait** is a collection of methods that a type must implement. Think of it like a **contract** or an **interface**: \"If you implement this trait, you promise to provide these methods.\"\n\nTraits let you write code that works with **any** type that fulfills the contract, regardless of what the type actually is.",
      },
      {
        type: "analogy",
        title: "The Analogy: Job Requirements",
        content:
          "Imagine a job posting that says \"Must be able to: speak, write reports, and attend meetings.\" Any person who can do those three things qualifies, whether they're an engineer, a designer, or an accountant. The job doesn't care who you are, only what you can do.\n\nIn Rust, a trait is that job posting. Any type that implements the required methods qualifies, and can be used wherever that trait is expected.",
      },
      {
        type: "code",
        title: "Defining and Implementing a Trait",
        explanation:
          "Use `trait` to define one, then `impl TraitName for Type` to implement it. Any type can implement any trait, even types from the standard library, with the orphan rule caveat.",
        code: `trait Describable {
    fn describe(&self) -> String;

    fn short_description(&self) -> String {
        format!("{}...", &self.describe()[..20.min(self.describe().len())])
    }
}

struct Dog {
    name: String,
    breed: String,
}

struct Car {
    make: String,
    model: String,
    year: u32,
}

impl Describable for Dog {
    fn describe(&self) -> String {
        format!("{} is a {}", self.name, self.breed)
    }
}

impl Describable for Car {
    fn describe(&self) -> String {
        format!("{} {} ({})", self.year, self.make, self.model)
    }
}

fn print_description(item: &impl Describable) {
    println!("{}", item.describe());
}

fn main() {
    let dog = Dog {
        name: String::from("Rex"),
        breed: String::from("Labrador"),
    };
    let car = Car {
        make: String::from("Toyota"),
        model: String::from("Corolla"),
        year: 2023,
    };

    print_description(&dog);
    print_description(&car);
    println!("{}", dog.short_description());
}`,
      },
      {
        type: "code",
        title: "Common Standard Library Traits",
        explanation:
          "Rust's standard library is built on traits. You can derive many of the common ones automatically with `#[derive(...)]`.",
        code: `#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

use std::fmt;

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p1 = Point { x: 1.0, y: 2.0 };
    let p2 = p1.clone();

    println!("{:?}", p1);
    println!("{}", p1);
    println!("Equal? {}", p1 == p2);
}`,
      },
      {
        type: "table",
        title: "Essential Traits to Know",
        headers: ["Trait", "What it enables", "How to get it"],
        rows: [
          ["Debug", "Print with {:?}", "#[derive(Debug)]"],
          ["Display", "Print with {}", "impl fmt::Display manually"],
          ["Clone", ".clone() deep copy", "#[derive(Clone)]"],
          ["Copy", "Auto-copy on assign", "#[derive(Copy, Clone)]"],
          ["PartialEq", "== and != operators", "#[derive(PartialEq)]"],
          ["PartialOrd", "<, >, <=, >= operators", "#[derive(PartialOrd)]"],
          ["Iterator", ".map(), .filter(), etc.", "impl Iterator manually"],
          ["From/Into", "Type conversions", "impl From<T> manually"],
        ],
      },
    ],
  },
  {
    id: 2,
    part: 1,
    partLabel: "Traits & Generics",
    title: "Generics: One Code, Many Types",
    emoji: "🔧",
    tagline: "Write it once, use it everywhere",
    color: "#10b981",
    sections: [
      {
        type: "intro",
        content:
          "Generics let you write a function or struct that works with **any type**, rather than one specific type. You've already used generics, `Vec<T>`, `Option<T>`, and `Result<T, E>` are all generic.\n\nThe `T` is a **type parameter**, a placeholder that gets filled in when you actually use the code. You can constrain generics with traits to say \"this works with any type that implements X.\"",
      },
      {
        type: "analogy",
        title: "The Analogy: A Universal Remote",
        content:
          "A universal remote works with any TV brand, Samsung, LG, Sony, as long as the TV supports the expected protocol. Generics are similar: your function works with any type, as long as that type implements the required trait.",
      },
      {
        type: "code",
        title: "Generic Functions",
        explanation:
          "The `<T>` declares a type parameter. Add trait bounds with `T: TraitName` to require specific behavior.",
        code: `fn largest_i32(list: &[i32]) -> i32 { todo!() }
fn largest_f64(list: &[f64]) -> f64 { todo!() }

fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("Largest number: {}", largest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("Largest char: {}", largest(&chars));
}`,
      },
      {
        type: "code",
        title: "Generic Structs and Methods",
        explanation:
          "Structs can also be generic. This is how standard types like `Vec<T>` and `HashMap<K, V>` are built.",
        code: `#[derive(Debug)]
struct Pair<T> {
    first: T,
    second: T,
}

impl<T> Pair<T> {
    fn new(first: T, second: T) -> Self {
        Pair { first, second }
    }

    fn swap(self) -> Pair<T> {
        Pair {
            first: self.second,
            second: self.first,
        }
    }
}

impl<T: PartialOrd + std::fmt::Display> Pair<T> {
    fn print_largest(&self) {
        if self.first >= self.second {
            println!("Largest: {}", self.first);
        } else {
            println!("Largest: {}", self.second);
        }
    }
}

fn main() {
    let pair = Pair::new(5, 10);
    pair.print_largest();

    let swapped = pair.swap();
    println!("{:?}", swapped);

    let words = Pair::new("apple", "zebra");
    words.print_largest();
}`,
      },
      {
        type: "code",
        title: "Trait Objects: Dynamic Dispatch",
        explanation:
          "When you need different concrete types in one collection, use `dyn Trait` and trait objects.",
        code: `trait Animal {
    fn name(&self) -> &str;
    fn sound(&self) -> &str;

    fn info(&self) -> String {
        format!("{} says '{}'", self.name(), self.sound())
    }
}

struct Dog;
struct Cat;
struct Cow;

impl Animal for Dog {
    fn name(&self) -> &str { "Dog" }
    fn sound(&self) -> &str { "Woof" }
}

impl Animal for Cat {
    fn name(&self) -> &str { "Cat" }
    fn sound(&self) -> &str { "Meow" }
}

impl Animal for Cow {
    fn name(&self) -> &str { "Cow" }
    fn sound(&self) -> &str { "Moo" }
}

fn main() {
    let animals: Vec<Box<dyn Animal>> = vec![
        Box::new(Dog),
        Box::new(Cat),
        Box::new(Cow),
    ];

    for animal in &animals {
        println!("{}", animal.info());
    }
}`,
      },
    ],
  },
  {
    id: 3,
    part: 2,
    partLabel: "Collections & Iterators",
    title: "Vec, HashMap, and HashSet",
    emoji: "📚",
    tagline: "Storing groups of data",
    color: "#f59e0b",
    sections: [
      {
        type: "intro",
        content:
          "Collections are data structures that store multiple values. Rust's standard library gives you three common workhorses:\n\n- **Vec<T>** for growable ordered lists\n- **HashMap<K, V>** for key-value pairs\n- **HashSet<T>** for unique values\n\nUnlike arrays, these live on the heap and can grow or shrink at runtime.",
      },
      {
        type: "code",
        title: "Vec<T>: The Workhorse Collection",
        explanation:
          "A `Vec` is the most common collection in Rust. It is contiguous, ordered, and growable.",
        code: `fn main() {
    let mut v: Vec<i32> = Vec::new();
    let v2 = vec![1, 2, 3, 4, 5];

    v.push(10);
    v.push(20);
    v.push(30);

    let third = &v2[2];
    let safe = v2.get(10);

    println!("Third: {}", third);
    println!("Safe get: {:?}", safe);

    for x in &v2 {
        print!("{} ", x);
    }
    println!();

    println!("Length: {}", v2.len());
    println!("Contains 3? {}", v2.contains(&3));
    println!("Sum: {}", v2.iter().sum::<i32>());

    let mut nums = vec![1, 2, 3, 4, 5];
    nums.pop();
    nums.remove(1);
    nums.retain(|&x| x % 2 != 0);
    println!("{:?}", nums);
}`,
      },
      {
        type: "code",
        title: "HashMap<K, V>: Key-Value Storage",
        explanation:
          "Use `HashMap` when lookups by key matter. The `entry()` API is the standard pattern for insert-or-update.",
        code: `use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();

    scores.insert(String::from("Alice"), 95);
    scores.insert(String::from("Bob"), 87);
    scores.insert(String::from("Carol"), 92);

    let alice_score = scores.get("Alice");
    println!("Alice: {:?}", alice_score);

    let dave = scores.get("Dave").copied().unwrap_or(0);
    println!("Dave: {}", dave);

    scores.entry(String::from("Dave")).or_insert(75);
    scores.entry(String::from("Alice")).or_insert(0);

    let text = "hello world hello rust hello";
    let mut word_count: HashMap<&str, i32> = HashMap::new();

    for word in text.split_whitespace() {
        let count = word_count.entry(word).or_insert(0);
        *count += 1;
    }

    println!("{:?}", word_count);
}`,
      },
      {
        type: "code",
        title: "HashSet<T>: Unique Values",
        explanation:
          "A `HashSet` stores unique values and gives you set operations such as union and intersection.",
        code: `use std::collections::HashSet;

fn main() {
    let mut set: HashSet<i32> = HashSet::new();

    set.insert(1);
    set.insert(2);
    set.insert(3);
    set.insert(2);

    println!("Set: {:?}", set);
    println!("Contains 2: {}", set.contains(&2));
    println!("Size: {}", set.len());

    let a: HashSet<i32> = vec![1, 2, 3, 4].into_iter().collect();
    let b: HashSet<i32> = vec![3, 4, 5, 6].into_iter().collect();

    let inter: HashSet<_> = a.intersection(&b).collect();
    let union: HashSet<_> = a.union(&b).collect();
    let diff: HashSet<_> = a.difference(&b).collect();

    println!("Intersection: {:?}", inter);
    println!("Union: {:?}", union);
    println!("Difference: {:?}", diff);
}`,
      },
    ],
  },
  {
    id: 4,
    part: 2,
    partLabel: "Collections & Iterators",
    title: "Iterators and Closures",
    emoji: "🔄",
    tagline: "Elegant, lazy data processing",
    color: "#f59e0b",
    sections: [
      {
        type: "intro",
        content:
          "Iterators are one of Rust's strongest features. They produce a sequence of values one at a time, and they are **lazy**, meaning they do no work until consumed.\n\nClosures are anonymous functions you can store or pass around. They are the fuel behind methods like `.map()`, `.filter()`, and `.fold()`.",
      },
      {
        type: "analogy",
        title: "The Assembly Line Analogy",
        content:
          "Imagine a factory line. Raw materials go through stations like wash, cut, paint, inspect, then finished products come out at the end. Iterator chains work the same way: data flows through transformations, and nothing is processed until the final step asks for results.",
      },
      {
        type: "code",
        title: "Closures",
        explanation:
          "Closures capture surrounding values and usually infer parameter and return types automatically.",
        code: `fn main() {
    let add = |a, b| a + b;
    println!("{}", add(3, 4));

    let threshold = 10;
    let is_above = |x| x > threshold;
    println!("{}", is_above(15));
    println!("{}", is_above(5));

    fn apply<F: Fn(i32) -> i32>(f: F, x: i32) -> i32 {
        f(x)
    }

    let double = |x| x * 2;
    let square = |x| x * x;

    println!("{}", apply(double, 5));
    println!("{}", apply(square, 5));

    let process = |x: i32| {
        let y = x * 2;
        let z = y + 1;
        z
    };

    println!("{}", process(5));
}`,
      },
      {
        type: "code",
        title: "Iterator Methods: The Power Combo",
        explanation:
          "The core toolkit is `map`, `filter`, `collect`, and `fold`. Most day-to-day data processing uses these together.",
        code: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let doubled: Vec<i32> = numbers.iter()
        .map(|&x| x * 2)
        .collect();
    println!("{:?}", doubled);

    let evens: Vec<&i32> = numbers.iter()
        .filter(|&&x| x % 2 == 0)
        .collect();
    println!("{:?}", evens);

    let even_squares: Vec<i32> = numbers.iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * x)
        .collect();
    println!("{:?}", even_squares);

    let sum = numbers.iter().fold(0, |acc, &x| acc + x);
    println!("Sum: {}", sum);

    println!("Sum: {}", numbers.iter().sum::<i32>());
    println!("Max: {:?}", numbers.iter().max());
    println!(
        "Count evens: {}",
        numbers.iter().filter(|&&x| x % 2 == 0).count()
    );
}`,
      },
      {
        type: "code",
        title: "More Iterator Superpowers",
        explanation:
          "Methods like `enumerate`, `zip`, `take`, `skip`, and `flat_map` cover a lot of real-world collection work.",
        code: `fn main() {
    let fruits = vec!["apple", "banana", "cherry"];

    for (i, fruit) in fruits.iter().enumerate() {
        println!("{}: {}", i, fruit);
    }

    let prices = vec![1.5, 0.75, 2.0];
    let menu: Vec<_> = fruits.iter().zip(prices.iter()).collect();
    println!("{:?}", menu);

    let nums: Vec<i32> = (1..=10).collect();
    let middle: Vec<i32> = nums.iter().skip(2).take(5).copied().collect();
    println!("{:?}", middle);

    let words = vec!["hello world", "foo bar"];
    let letters: Vec<&str> = words.iter()
        .flat_map(|s| s.split_whitespace())
        .collect();
    println!("{:?}", letters);

    let has_long = fruits.iter().any(|f| f.len() > 5);
    let all_short = fruits.iter().all(|f| f.len() < 10);
    println!("Has long? {} | All short? {}", has_long, all_short);
}`,
      },
    ],
  },
  {
    id: 5,
    part: 3,
    partLabel: "Concurrency & Threads",
    title: "Threads: Doing Work in Parallel",
    emoji: "⚡",
    tagline: "Fearless concurrency in Rust",
    color: "#f97316",
    sections: [
      {
        type: "intro",
        content:
          "Concurrency means doing multiple things at the same time. Rust's ownership system makes concurrency **fearless** by preventing data races at compile time.\n\nRust uses OS threads. Spawning one is easy. The difficult part, coordinating access safely, is what Rust's type system helps you enforce.",
      },
      {
        type: "analogy",
        title: "The Kitchen Analogy",
        content:
          "A single-threaded program is one chef doing everything in sequence. A multi-threaded system is a kitchen crew: one chops, another boils, another plates. It is faster, but only if they avoid fighting over the same tools. Rust's rules help enforce that coordination.",
      },
      {
        type: "code",
        title: "Spawning Threads",
        explanation:
          "Use `std::thread::spawn()` to create a new thread. Add `move` when captured values should transfer into the thread.",
        code: `use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..=5 {
            println!("Thread: {}", i);
            thread::sleep(Duration::from_millis(100));
        }
    });

    for i in 1..=3 {
        println!("Main: {}", i);
        thread::sleep(Duration::from_millis(150));
    }

    handle.join().unwrap();
    println!("Both threads done!");

    let message = String::from("Hello from main!");
    let handle2 = thread::spawn(move || {
        println!("{}", message);
    });

    handle2.join().unwrap();
}`,
      },
      {
        type: "code",
        title: "Message Passing with Channels",
        explanation:
          "Channels are the safest default way for threads to communicate. One side sends, the other receives.",
        code: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let messages = vec!["ping", "hello", "data", "done"];
        for msg in messages {
            tx.send(msg).unwrap();
            thread::sleep(std::time::Duration::from_millis(100));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }

    let (tx2, rx2) = mpsc::channel::<String>();
    let tx3 = tx2.clone();

    thread::spawn(move || {
        tx2.send(String::from("from thread 1")).unwrap();
    });
    thread::spawn(move || {
        tx3.send(String::from("from thread 2")).unwrap();
    });

    println!("{}", rx2.recv().unwrap());
    println!("{}", rx2.recv().unwrap());
}`,
      },
    ],
  },
  {
    id: 6,
    part: 3,
    partLabel: "Concurrency & Threads",
    title: "Shared State: Mutex and Arc",
    emoji: "🔒",
    tagline: "Safe shared memory across threads",
    color: "#f97316",
    sections: [
      {
        type: "intro",
        content:
          "Sometimes threads must share and mutate the same data. For that you usually combine two tools:\n\n- **Mutex<T>** means only one thread can access the data at a time\n- **Arc<T>** means shared ownership across threads using atomic reference counting\n\nYou will often see them together as `Arc<Mutex<T>>`.",
      },
      {
        type: "analogy",
        title: "The Analogy: A Shared Notebook with a Lock",
        content:
          "Imagine a notebook in an office that several people need to update. To prevent chaos, it has a lock. Whoever holds the lock can write. Everyone else waits. `Mutex` is the lock; `Arc` is how everyone is allowed to hold a shared reference to the notebook itself.",
      },
      {
        type: "code",
        title: "Mutex<T>: Mutual Exclusion",
        explanation:
          "Call `.lock()` to get a guard. When the guard goes out of scope, the lock is released automatically.",
        code: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter_clone = Arc::clone(&counter);

        let handle = thread::spawn(move || {
            let mut num = counter_clone.lock().unwrap();
            *num += 1;
        });

        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final counter: {}", *counter.lock().unwrap());
}`,
      },
      {
        type: "code",
        title: "Putting It Together: Parallel Processing",
        explanation:
          "This divide-process-combine pattern is a practical example of fork-join concurrency.",
        code: `use std::sync::{Arc, Mutex};
use std::thread;

fn parallel_sum(numbers: Vec<i32>, num_threads: usize) -> i32 {
    let chunk_size = (numbers.len() + num_threads - 1) / num_threads;
    let result = Arc::new(Mutex::new(0i32));
    let numbers = Arc::new(numbers);

    let mut handles = vec![];

    for chunk_start in (0..numbers.len()).step_by(chunk_size) {
        let result_clone = Arc::clone(&result);
        let numbers_clone = Arc::clone(&numbers);

        let handle = thread::spawn(move || {
            let chunk_end = (chunk_start + chunk_size).min(numbers_clone.len());
            let chunk_sum: i32 = numbers_clone[chunk_start..chunk_end].iter().sum();

            let mut total = result_clone.lock().unwrap();
            *total += chunk_sum;
        });

        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    *result.lock().unwrap()
}

fn main() {
    let big_list: Vec<i32> = (1..=100).collect();
    let sum = parallel_sum(big_list, 4);
    println!("Sum: {}", sum);
}`,
      },
      {
        type: "table",
        title: "Concurrency Primitives Cheat Sheet",
        headers: ["Type", "Use case", "Thread safe?"],
        rows: [
          ["thread::spawn", "Run code in a new OS thread", "Yes"],
          ["mpsc::channel", "Send messages between threads", "Yes"],
          ["Mutex<T>", "Shared mutable state", "Yes with Arc"],
          ["Arc<T>", "Shared ownership across threads", "Yes"],
          ["RwLock<T>", "Many readers or one writer", "Yes with Arc"],
          ["Rc<T>", "Shared ownership, single thread only", "No"],
          ["RefCell<T>", "Interior mutability, single thread", "No"],
          ["Atomic types", "Lock-free primitive updates", "Yes"],
        ],
      },
    ],
  },
  {
    id: 7,
    part: 3,
    partLabel: "Concurrency & Threads",
    title: "What's Next: Async Rust",
    emoji: "🌊",
    tagline: "The future of concurrent Rust",
    color: "#f97316",
    sections: [
      {
        type: "intro",
        content:
          "You've learned OS threads, which are great for CPU-heavy work. The next major model is **async/await**, which is ideal for I/O-bound work like web servers, network calls, and database access.\n\nAsync Rust lets code look sequential while the runtime keeps many operations moving without blocking an OS thread per task.",
      },
      {
        type: "analogy",
        title: "Threads vs Async",
        content:
          "**Threads** are like hiring extra workers. Each worker does one job at a time. Great for CPU-heavy tasks.\n\n**Async** is like one efficient waiter managing many tables. Instead of standing idle while one table waits on the kitchen, the waiter serves others and returns when something is ready. Great for network and disk I/O.",
      },
      {
        type: "code",
        title: "A Taste of Async/Await",
        explanation:
          "Async functions return futures. You need a runtime such as Tokio to drive them.",
        code: `use tokio::time::{sleep, Duration};

async fn fetch_data(id: u32) -> String {
    println!("Fetching data for id {}...", id);
    sleep(Duration::from_secs(1)).await;
    format!("Data for id {}", id)
}

async fn process() {
    let (a, b, c) = tokio::join!(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3),
    );

    println!("{}", a);
    println!("{}", b);
    println!("{}", c);
}

#[tokio::main]
async fn main() {
    process().await;
}`,
      },
      {
        type: "table",
        title: "Series 3 Roadmap",
        headers: ["Topic", "What you'll learn"],
        rows: [
          ["Async/Await Deep Dive", "Futures, runtimes, and async patterns"],
          ["Tokio", "The dominant async runtime for production Rust"],
          ["Lifetimes", "How long references are valid"],
          ["Smart Pointers", "Box, Rc, RefCell, Arc"],
          ["Macros", "Code that writes code"],
          ["Testing", "Unit, integration, and doc tests"],
          ["Build a Web API", "Real services with Axum or Actix"],
          ["CLI Tools", "Ship command-line apps with Clap"],
        ],
      },
      {
        type: "analogy",
        title: "You've Completed Series 2",
        content:
          "Look at the path so far:\n\n- **Series 1** covered variables, functions, ownership, control flow, structs, enums, and error handling\n- **Series 2** covered traits, generics, collections, iterators, closures, threads, shared state, and async direction\n\nThat is enough to start building real Rust programs with stronger abstractions and safer concurrency habits.",
      },
    ],
  },
];

export default function RustSeries2TutorialContent() {
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
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-400/10 via-amber-400/10 to-orange-400/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-blue-100/65">
              Rust continuation
            </p>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white md:text-3xl">
                Series 2: Intermediate Rust
              </h3>
              <p className="max-w-3xl text-sm leading-7 text-blue-100/80 md:text-base">
                This continues the beginner Rust tutorial with reusable type
                design, iterator fluency, and safe concurrency patterns.
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
                <p className="text-sm font-semibold text-white">Rust Series 2</p>
                <p className="text-xs text-blue-100/60">
                  7 chapters, 3 focused parts
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
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-400 transition-all duration-500"
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
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
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
                    : "Finish Series 2"}
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
