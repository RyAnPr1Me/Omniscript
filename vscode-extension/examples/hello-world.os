// Omniscript Hello World Example
function main(): void {
    console.log("Hello, World from Omniscript!");
    
    // Type-safe variables
    const message: string = "Welcome to Omniscript";
    const version: number = 2.1;
    const isActive: boolean = true;
    
    // Pattern matching example
    match (version) {
        case 1.0 => console.log("Legacy version");
        case 2.0 => console.log("Current stable");
        case x if x > 2.0 => console.log(`Future version: ${x}`);
        default => console.log("Unknown version");
    }
    
    // Async/await example
    await fetchData();
}

async function fetchData(): Promise<string> {
    const data = await fetch("https://api.example.com/data");
    return data.text();
}

// Class with type safety
class User {
    constructor(
        public name: string,
        public age: number,
        private email: string
    ) {}
    
    greet(): string {
        return `Hello, I'm ${this.name} and I'm ${this.age} years old`;
    }
}

// Interface definition
interface DatabaseConnection {
    connect(): Promise<void>;
    query(sql: string): Promise<any[]>;
    close(): Promise<void>;
}

// Run the main function
main().catch(console.error);