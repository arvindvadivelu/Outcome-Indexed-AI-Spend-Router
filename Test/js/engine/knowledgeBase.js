/**
 * AURA Knowledge Base & Instant Data Repository
 * Provides rich indexed knowledge, multi-modal assets, market feeds, and encyclopedic entries.
 */

export const KnowledgeBase = {
  trendingQueries: [
    { query: "How do Quantum Computers differ from Classical Computers?", category: "Quantum Physics", icon: "atom" },
    { query: "NVDA stock price and earnings analysis", category: "Finance", icon: "trending-up" },
    { query: "Implement LRU Cache in Python with O(1) operations", category: "Code", icon: "code" },
    { query: "Weather in Tokyo 7-day forecast", category: "Weather", icon: "cloud-sun" },
    { query: "Transformer Attention Mechanism mathematically explained", category: "AI Research", icon: "brain" },
    { query: "CRISPR gene editing breakthroughs in longevity", category: "Biotech", icon: "dna" },
    { query: "James Webb Space Telescope latest exoplanet discoveries", category: "Space", icon: "compass" },
    { query: "Compare Rust vs Go for high-throughput distributed systems", category: "Engineering", icon: "layers" }
  ],

  financeDatabase: {
    NVDA: {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      price: 138.25,
      change: "+4.18%",
      isPositive: true,
      mktCap: "$3.41 Trillion",
      peRatio: "48.2",
      volume: "58.4M",
      high52: "$140.76",
      low52: "$45.11",
      history: [118, 122, 120, 125, 129, 128, 132, 135, 134, 138.25]
    },
    AAPL: {
      ticker: "AAPL",
      name: "Apple Inc.",
      price: 232.10,
      change: "+1.05%",
      isPositive: true,
      mktCap: "$3.55 Trillion",
      peRatio: "34.1",
      volume: "42.1M",
      high52: "$237.23",
      low52: "$164.08",
      history: [215, 218, 222, 220, 226, 228, 230, 229, 231, 232.10]
    },
    GOOGL: {
      ticker: "GOOGL",
      name: "Alphabet Inc.",
      price: 184.60,
      change: "-0.45%",
      isPositive: false,
      mktCap: "$2.28 Trillion",
      peRatio: "25.8",
      volume: "24.6M",
      high52: "$191.75",
      low52: "$129.40",
      history: [175, 178, 182, 186, 185, 188, 187, 186, 185, 184.60]
    },
    MSFT: {
      ticker: "MSFT",
      name: "Microsoft Corporation",
      price: 448.90,
      change: "+1.85%",
      isPositive: true,
      mktCap: "$3.33 Trillion",
      peRatio: "36.4",
      volume: "19.8M",
      high52: "$468.35",
      low52: "$309.45",
      history: [420, 425, 430, 435, 432, 438, 442, 440, 445, 448.90]
    },
    BTC: {
      ticker: "BTC-USD",
      name: "Bitcoin",
      price: 68450.00,
      change: "+3.42%",
      isPositive: true,
      mktCap: "$1.35 Trillion",
      peRatio: "N/A",
      volume: "$28.9B",
      high52: "$73,750",
      low52: "$25,120",
      history: [62000, 63500, 64200, 63800, 65900, 66800, 67200, 66500, 67800, 68450]
    }
  },

  weatherDatabase: {
    tokyo: {
      city: "Tokyo, Japan",
      temp: "22°C",
      condition: "Partly Cloudy",
      humidity: "58%",
      wind: "14 km/h",
      uv: "Moderate (4)",
      forecast: [
        { day: "Today", temp: "22° / 16°", icon: "cloud-sun" },
        { day: "Wed", temp: "24° / 17°", icon: "sun" },
        { day: "Thu", temp: "21° / 15°", icon: "cloud-rain" },
        { day: "Fri", temp: "23° / 16°", icon: "sun" },
        { day: "Sat", temp: "25° / 18°", icon: "sun" }
      ]
    },
    "new york": {
      city: "New York, USA",
      temp: "19°C",
      condition: "Clear & Sunny",
      humidity: "46%",
      wind: "11 km/h",
      uv: "High (6)",
      forecast: [
        { day: "Today", temp: "19° / 12°", icon: "sun" },
        { day: "Wed", temp: "21° / 14°", icon: "sun" },
        { day: "Thu", temp: "18° / 13°", icon: "cloud" },
        { day: "Fri", temp: "17° / 11°", icon: "cloud-rain" },
        { day: "Sat", temp: "20° / 14°", icon: "sun" }
      ]
    },
    london: {
      city: "London, UK",
      temp: "16°C",
      condition: "Overcast with Light Drizzle",
      humidity: "78%",
      wind: "18 km/h",
      uv: "Low (2)",
      forecast: [
        { day: "Today", temp: "16° / 10°", icon: "cloud-rain" },
        { day: "Wed", temp: "15° / 9°", icon: "cloud" },
        { day: "Thu", temp: "17° / 11°", icon: "cloud-sun" },
        { day: "Fri", temp: "18° / 12°", icon: "sun" },
        { day: "Sat", temp: "16° / 10°", icon: "cloud-rain" }
      ]
    },
    paris: {
      city: "Paris, France",
      temp: "18°C",
      condition: "Mild & Breezy",
      humidity: "52%",
      wind: "13 km/h",
      uv: "Moderate (4)",
      forecast: [
        { day: "Today", temp: "18° / 11°", icon: "cloud-sun" },
        { day: "Wed", temp: "20° / 12°", icon: "sun" },
        { day: "Thu", temp: "22° / 14°", icon: "sun" },
        { day: "Fri", temp: "19° / 13°", icon: "cloud" },
        { day: "Sat", temp: "17° / 11°", icon: "cloud-rain" }
      ]
    },
    "san francisco": {
      city: "San Francisco, USA",
      temp: "17°C",
      condition: "Coastal Fog Clearing to Sun",
      humidity: "68%",
      wind: "22 km/h",
      uv: "Moderate (5)",
      forecast: [
        { day: "Today", temp: "17° / 12°", icon: "cloud-sun" },
        { day: "Wed", temp: "18° / 13°", icon: "sun" },
        { day: "Thu", temp: "19° / 13°", icon: "sun" },
        { day: "Fri", temp: "17° / 12°", icon: "cloud" },
        { day: "Sat", temp: "18° / 13°", icon: "sun" }
      ]
    }
  },

  sampleTopics: {
    quantum: {
      title: "Quantum Computing vs. Classical Computing",
      summary: `**Quantum computing** leverages the fundamental principles of quantum mechanics—specifically **superposition** and **entanglement**—to process complex computational problems exponentially faster than classical computers for specific problem classes. [1]

### Key Architectural Differences:
1. **Information Units (Bits vs. Qubits)**: Classical computers encode information in discrete binary states ($0$ or $1$). In contrast, quantum computers utilize **qubits**, which can exist in a linear superposition $\\alpha|0\\rangle + \\beta|1\\rangle$, enabling parallel state evaluation across $2^N$ states simultaneously for $N$ qubits. [2]
2. **Entanglement & Interdependence**: Entangled qubits exhibit non-local correlation; measuring one instantly reveals properties of its entangled counterpart, allowing algorithms like *Shor's Algorithm* and *Grover's Search* to solve prime factorization and unstructured search at polynomial and square-root speedups. [3]
3. **Operational Environment**: Superconducting quantum processors (such as IBM Quantum Heron or Google Sycamore) require cryogenic dilution refrigerators operating at approximately **15 millikelvin** (colder than interstellar space) to maintain quantum coherence and mitigate thermal decoherence noise. [4]

### Comparative Overview:
| Feature | Classical Computing | Quantum Computing |
| :--- | :--- | :--- |
| **Fundamental Unit** | Bit (0 or 1) | Qubit (Superposition of 0 & 1) |
| **Logic Gates** | Deterministic (AND, OR, NOT) | Unitary Transformations (Hadamard, CNOT) |
| **Decoherence Risk** | Negligible at room temp | High sensitivity to thermal/EM noise |
| **Primary Use Cases** | General software, web, database queries | Drug discovery, cryptography, quantum chemistry |`,
      sources: [
        { title: "Nature Quantum Information: Benchmarking Quantum Supremacy", domain: "nature.com", index: 1 },
        { title: "MIT Technology Review: The Practical Guide to Qubits", domain: "technologyreview.com", index: 2 },
        { title: "IBM Quantum Systems: Heron Architecture Whitepaper", domain: "ibm.com", index: 3 },
        { title: "ArXiv Quantum Physics: Error Mitigation and Fault Tolerance", domain: "arxiv.org", index: 4 }
      ],
      graphNodes: [
        { id: "Quantum Computing", group: "core", radius: 24 },
        { id: "Superposition", group: "principle", radius: 18 },
        { id: "Entanglement", group: "principle", radius: 18 },
        { id: "Shor's Algorithm", group: "algorithm", radius: 16 },
        { id: "Grover's Search", group: "algorithm", radius: 16 },
        { id: "Cryogenics (15mK)", group: "hardware", radius: 15 },
        { id: "Fault-Tolerant Qubits", group: "future", radius: 17 },
        { id: "Post-Quantum Cryptography", group: "security", radius: 18 }
      ],
      graphLinks: [
        { source: "Quantum Computing", target: "Superposition" },
        { source: "Quantum Computing", target: "Entanglement" },
        { source: "Quantum Computing", target: "Cryogenics (15mK)" },
        { source: "Quantum Computing", target: "Fault-Tolerant Qubits" },
        { source: "Superposition", target: "Grover's Search" },
        { source: "Entanglement", target: "Shor's Algorithm" },
        { source: "Shor's Algorithm", target: "Post-Quantum Cryptography" }
      ]
    },

    lru: {
      title: "LRU Cache Implementation in Python",
      summary: `An **LRU (Least Recently Used) Cache** is a key-value data structure with fixed capacity that automatically evicts the least recently accessed element when capacity is exceeded. It achieves $O(1)$ constant time complexity for both \`get\` and \`put\` operations by combining a **Hash Map** with a **Doubly Linked List**. [1]

### Algorithmic Breakdown:
- **Hash Map**: Maps key $\\to$ Doubly Linked List Node for immediate $O(1)$ lookup.
- **Doubly Linked List**: Maintains chronological access order with sentinel \`head\` (most recently used) and \`tail\` (least recently used) nodes. [2]`,
      code: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {} # key -> Node
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node: Node):
        p, n = node.prev, node.next
        p.next, n.prev = n, p

    def _insert_to_head(self, node: Node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._insert_to_head(node)
            return node.val
        return -1

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = Node(key, value)
        self.cache[key] = node
        self._insert_to_head(node)
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]

# Test Execution:
lru = LRUCache(2)
lru.put(1, 100)
lru.put(2, 200)
print(f"Get key 1: {lru.get(1)}") # Returns 100
lru.put(3, 300) # Evicts key 2
print(f"Get key 2 (Evicted): {lru.get(2)}") # Returns -1
print(f"Get key 3: {lru.get(3)}") # Returns 300`,
      output: `[Execution output]:\nGet key 1: 100\nGet key 2 (Evicted): -1\nGet key 3: 300\nTime complexity: O(1) Get / O(1) Put | Space: O(Capacity)`,
      sources: [
        { title: "LeetCode 146: LRU Cache Optimal Solution", domain: "leetcode.com", index: 1 },
        { title: "GeeksforGeeks: Doubly Linked List Hash Map Caching Design", domain: "geeksforgeeks.org", index: 2 }
      ],
      graphNodes: [
        { id: "LRU Cache", group: "core", radius: 22 },
        { id: "Hash Map O(1)", group: "structure", radius: 18 },
        { id: "Doubly Linked List", group: "structure", radius: 18 },
        { id: "Eviction Policy", group: "logic", radius: 16 },
        { id: "LFU Cache Variant", group: "variant", radius: 15 },
        { id: "Redis Caching Engine", group: "application", radius: 17 }
      ],
      graphLinks: [
        { source: "LRU Cache", target: "Hash Map O(1)" },
        { source: "LRU Cache", target: "Doubly Linked List" },
        { source: "LRU Cache", target: "Eviction Policy" },
        { source: "Eviction Policy", target: "LFU Cache Variant" },
        { source: "LRU Cache", target: "Redis Caching Engine" }
      ]
    }
  }
};
