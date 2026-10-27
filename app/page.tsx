"use client";

import { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";

const problems = [
  {
    id: 1,
    title: "Find the Second Largest",
    difficulty: "Easy",
    category: "Arrays",
    solved: "7/10",
    description:
      "Find the second-largest distinct element in the given array.",
    hint: "Check how your code handles duplicate maximum values.",
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int max = Integer.MIN_VALUE;
        int second = Integer.MIN_VALUE;

        while (sc.hasNextInt()) {
            int n = sc.nextInt();

            if (n > max) {
                second = max;
                max = n;
            } else if (n > second && n < max) {
                second = n;
            }
        }

        if (second == Integer.MIN_VALUE) {
            System.out.println("No second largest");
        } else {
            System.out.println(second);
        }

        sc.close();
    }
}`,
  },
  {
    id: 2,
    title: "Reverse an Array",
    difficulty: "Easy",
    category: "Arrays",
    solved: "6/10",
    description: "Reverse the elements of an array.",
    hint: "Check your loop boundaries and the indices you swap.",
    code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};

        for (int i = 0; i < arr.length / 2; i++) {
            int temp = arr[i];
            arr[i] = arr[arr.length - 1 - i];
            arr[arr.length - 1 - i] = temp;
        }

        for (int n : arr) {
            System.out.print(n + " ");
        }
    }
}`,
  },
  {
    id: 3,
    title: "Check Prime Number",
    difficulty: "Medium",
    category: "Mathematics",
    solved: "5/10",
    description: "Determine whether a number is prime.",
    hint: "Think about numbers less than 2 and the loop condition.",
    code: `
    import java.util.Scanner;
    public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
        boolean prime = n >= 2;

        for (int i = 2; i < n; i++) {
            if (n % i == 0) {
                prime = false;
                break;
            }
        }

        System.out.println(prime ? "Prime" : "Not Prime");
    }
}`,
  },
];
const testCases: Record<
  number,
  { input: string; expectedOutput: string }[]
> = {
  1: [
    { input: "10 20 20 5", expectedOutput: "10" },
    { input: "5 8 3 2", expectedOutput: "5" },
    { input: "7 7 7", expectedOutput: "No second largest" },
  ],
  2: [
    { input: "1 2 3 4 5", expectedOutput: "5 4 3 2 1" },
    { input: "9 2 6", expectedOutput: "6 2 9" },
  ],
  3: [
    { input: "1", expectedOutput: "Not Prime" },
    { input: "7", expectedOutput: "Prime" },
    { input: "8", expectedOutput: "Not Prime" },
  ],
};
export default function Home() {
  const [activeProblem, setActiveProblem] = useState(problems[0]);
  const [code, setCode] = useState(problems[0].code);
  const [language, setLanguage] = useState("Java");
  const [showHint, setShowHint] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [score, setScore] = useState(0);
const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);
const [progressLoaded, setProgressLoaded] = useState(false);
const [difficultyFilter, setDifficultyFilter] = useState("All");
useEffect(() => {
  const savedScore = localStorage.getItem("debugArenaScore");
  const savedSolved = localStorage.getItem("debugArenaSolved");

  if (savedScore !== null) {
    setScore(Number(savedScore));
  }

  if (savedSolved !== null) {
    try {
      setSolvedChallenges(JSON.parse(savedSolved));
    } catch {
      setSolvedChallenges([]);
    }
  }

  setProgressLoaded(true);
}, []);

useEffect(() => {
  if (!progressLoaded) return;

  localStorage.setItem("debugArenaScore", String(score));
  localStorage.setItem(
    "debugArenaSolved",
    JSON.stringify(solvedChallenges)
  );
}, [score, solvedChallenges, progressLoaded]);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Code");

  function selectProblem(problem: (typeof problems)[number]) {
    setActiveProblem(problem);
    setCode(problem.code);
    setShowHint(false);
    setHasRun(false);
    setExecutionResult(null);
  }
  function resetProgress() {
  const confirmed = window.confirm(
    "Are you sure you want to reset all your progress?"
  );

  if (!confirmed) return;

  localStorage.removeItem("debugArenaScore");
  localStorage.removeItem("debugArenaSolved");

  setScore(0);
  setSolvedChallenges([]);
  setShowHint(false);
  setHasRun(false);
  setExecutionResult(null);

  alert("Progress reset successfully!");
}
async function runDemo() {
  setHasRun(true);
  setActiveTab("Test Results");
  setExecutionResult({ loading: true });

  try {
    const cases = testCases[activeProblem.id];
    const results = [];

    for (const testCase of cases) {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          input: testCase.input,
        }),
      });

      const result = await response.json();

     const actualOutput = String(
  result.output ??
    result.stdout ??
    result.stdout_text ??
    ""
)
  .trim()
  .replace(/\s+/g, " ");

      const passed =
        response.ok &&
        !result.error &&
        actualOutput === testCase.expectedOutput;

      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput,
        passed,
        error: response.ok
          ? result.error ?? null
          : result.error || "Code execution failed.",
      });
    }

    const passedCount = results.filter(
      (testCase) => testCase.passed
    ).length;

    setExecutionResult({
  results,
  passedCount,
  totalCount: results.length,
  passed: passedCount === results.length,
});

if (passedCount === results.length && results.length > 0) {
  if (!solvedChallenges.includes(activeProblem.id)) {
    setSolvedChallenges((previous) => {
      if (previous.includes(activeProblem.id)) {
        return previous;
      }

      return [...previous, activeProblem.id];
    });

    setScore((current) => current + 100);
  }
}
  } catch {
    setExecutionResult({
      error: "Could not run code. Check your connection and API settings.",
    });
  }
}

 
const filteredProblems = problems.filter((problem) => {
  return (
    difficultyFilter === "All" ||
    problem.difficulty === difficultyFilter
  );
});

  
    
    return (
  <main className="min-h-screen bg-[#09090f] text-slate-100">

    

    <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0d0d16] p-5 md:flex md:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black">
              A
            </div>
            <div>
              <h1 className="font-bold tracking-wide">DebugArena</h1>
              <p className="text-xs text-slate-500">AI-powered debugging</p>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            <a
              href="#dashboard"
              className="block rounded-xl bg-violet-600/15 px-4 py-3 text-sm text-violet-300"
            >
              ◈ Dashboard
            </a>
            <a
              href="#challenges"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              ▤ Challenges
            </a>
            <a
              href="#editor"
              className="block rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              &lt;/&gt; Code Editor
            </a>
          </nav>

          <div className="mt-auto rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-sm font-semibold">Keep debugging!</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Every failed test is an opportunity to learn something new.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 font-bold md:hidden">
                A
              </div>
              <div>
                <p className="text-sm font-semibold">AI Debugging Arena</p>
                <p className="text-xs text-slate-500">
                  Learn to find. Learn to fix.
                </p>
              </div>
            </div>

            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
              ● Development mode
            </div>
          </header>

          <div id="dashboard" className="mx-auto w-full max-w-[1600px] min-w-0 p-4 md:p-6 xl:p-8">
             {/* Score Dashboard */}
    
<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
  <p className="text-sm text-slate-400">Total Score</p>

  <h2 className="mt-2 text-2xl font-bold text-violet-400">
    {score}
  </h2>

  <button
    onClick={resetProgress}
    className="mt-4 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
  >
    Reset Progress
  </button>
</div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-400">Challenges Solved</p>
        <h2 className="mt-2 text-2xl font-bold text-emerald-400">
          {solvedChallenges.length}
        </h2>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-400">Total Challenges</p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          {problems.length}
        </h2>
      </div>
     </div> 
{/* Leaderboard Dashboard */}
<div className="mb-8 grid w-full min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">

  {/* Leaderboard */}
<div className="box-border min-w-0 w-full rounded-2xl border border-white/10 bg-[#11111c] p-6">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-violet-400">
          🏆 COMPETITION
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">
          Leaderboard
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Track your debugging performance.
        </p>
      </div>

      <span className="text-4xl">🏆</span>
    </div>

    <div className="space-y-3">
      {[
        { name: "Code Ninja", points: 500, rank: "🥇" },
        { name: "Bug Hunter", points: 300, rank: "🥈" },
        { name: "You", points: score, rank: "🥉" },
      ]
        .sort((a, b) => b.points - a.points)
        .map((player, index) => (
          <div
            key={player.name}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3 sm:p-4 ${
              player.name === "You"
                ? "border-violet-500/40 bg-violet-500/10"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{player.rank}</span>

              <div>
                <p className="font-semibold text-white">
                  {player.name}
                  {player.name === "You" && (
                    <span className="ml-2 text-xs text-violet-400">
                      (You)
                    </span>
                  )}
                </p>

                <p className="text-xs text-slate-500">
                  Rank #{index + 1}
                </p>
              </div>
            </div>

            <p className="font-bold text-violet-400">
              {player.points} XP
            </p>
          </div>
        ))}
    </div>

    <p className="mt-4 text-xs text-slate-500">
      Demo leaderboard · Sample players and scores
    </p>
  </div>

  {/* Performance Card */}
<div className="box-border min-w-0 w-full rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 to-[#11111c] p-6">
    <div>
     <p className="text-sm font-medium leading-5 text-violet-300">
  YOUR PERFORMANCE
</p>

      <h3 className="mt-3 text-xl font-bold text-white">
        Keep debugging!
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Every challenge you solve brings you closer to mastering debugging.
      </p>
    </div>

    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          Challenges completed
        </span>

        <span className="font-bold text-emerald-400">
          {solvedChallenges.length}/{problems.length}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-500"
          style={{
            width: `${
              problems.length > 0
                ? (solvedChallenges.length / problems.length) * 100
                : 0
            }%`,
          }}
        />
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm text-slate-400">Total XP earned</p>
        <p className="mt-1 text-3xl font-bold text-violet-400">
          {score} XP
        </p>
      </div>
    </div>
  </div>

</div>
    
    {/* Achievements Section */}
<div className="mb-8 rounded-2xl border border-white/10 bg-[#11111c] p-6">
  <div className="mb-5">
    <p className="text-sm font-medium text-violet-400">
      ✨ MILESTONES
    </p>
    <h2 className="mt-1 text-2xl font-bold text-white">
      Achievements & Badges
    </h2>
    <p className="mt-1 text-sm text-slate-400">
      Solve challenges to unlock achievements.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {[
      {
        title: "First Steps",
        description: "Solve your first challenge",
        icon: "🐣",
        unlocked: solvedChallenges.length >= 1,
      },
      {
        title: "Bug Hunter",
        description: "Solve 2 challenges",
        icon: "🐞",
        unlocked: solvedChallenges.length >= 2,
      },
      {
        title: "Debug Master",
        description: "Solve all challenges",
        icon: "👑",
        unlocked:
          problems.length > 0 &&
          solvedChallenges.length >= problems.length,
      },
    ].map((badge) => (
      <div
        key={badge.title}
        className={`rounded-xl border p-5 transition ${
          badge.unlocked
            ? "border-violet-500/40 bg-violet-500/10"
            : "border-white/10 bg-white/[0.02] opacity-60"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-3xl">{badge.icon}</span>
          <span
            className={`text-xs font-semibold ${
              badge.unlocked ? "text-emerald-400" : "text-slate-500"
            }`}
          >
            {badge.unlocked ? "UNLOCKED ✓" : "LOCKED 🔒"}
          </span>
        </div>

        <h3 className="mt-4 font-bold text-white">
          {badge.title}
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          {badge.description}
        </p>
      </div>
    ))}
  </div>

  <p className="mt-4 text-sm text-slate-400">
    Badges unlocked:{" "}
    <span className="font-bold text-violet-400">
      {[
        solvedChallenges.length >= 1,
        solvedChallenges.length >= 2,
        problems.length > 0 &&
          solvedChallenges.length >= problems.length,
      ].filter(Boolean).length}
      /3
    </span>
  </p>
</div>
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-violet-400">
                YOUR DEBUGGING WORKSPACE
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Find the bug. <span className="text-violet-400">Own the fix.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Practise coding, uncover hidden bugs, and improve your problem-solving
                skills with guided AI hints.
              </p>
            </div>

            <div className="mb-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: "Available challenges", value: String(problems.length).padStart(2, "0"), icon: "⌘" },
                { label: "Languages supported", value: "02", icon: "</>" },
                { label: "Learning mode", value: "AI Hints", icon: "✳" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-[#11111c] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-slate-400">{stat.label}</span>
                    <span className="text-lg text-violet-400">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div
  id="challenges"
  className="mb-8 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)]"
>
  {/* Challenges Sidebar */}
  <div className="rounded-2xl border border-white/10 bg-[#11111c] p-4">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-semibold">Challenges</h3>
      <span className="text-xs text-slate-500">
        {filteredProblems.length} problems
      </span>
    </div>

    {/* Difficulty Filters */}
    <div className="mb-4 flex flex-wrap gap-2">
      {["All", "Easy", "Medium", "Hard"].map((level) => (
        <button
          key={level}
          onClick={() => setDifficultyFilter(level)}
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
            difficultyFilter === level
              ? "bg-violet-600 text-white"
              : "border border-white/10 text-slate-400 hover:bg-white/5"
          }`}
        >
          {level}
        
        </button>
      ))}
    </div>

    {/* Challenge List */}
    <div className="space-y-3">
      {filteredProblems.map((problem) => (
        <button
          key={problem.id}
          onClick={() => selectProblem(problem)}
          className={`w-full rounded-xl border p-4 text-left transition ${
            activeProblem.id === problem.id
              ? "border-violet-500/50 bg-violet-500/10"
              : "border-white/5 bg-white/[0.02] hover:border-white/20"
          }`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              Problem {String(problem.id).padStart(2, "0")}
            </span>

            <span
              className={`text-xs ${
                problem.difficulty === "Easy"
                  ? "text-emerald-400"
                  : problem.difficulty === "Medium"
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {problem.difficulty}
            </span>
          </div>

          <p className="text-sm font-semibold">{problem.title}</p>

          <p className="mt-2 text-xs text-slate-500">
            {problem.category}
          </p>
        </button>
      ))}

      {filteredProblems.length === 0 && (
        <p className="py-4 text-center text-sm text-slate-500">
          No challenges in this difficulty yet.
        </p>
      )}
    </div>
  </div>


              <div
                id="editor"
                className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#11111c]"
              >
                <div className="border-b border-white/10 p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-violet-500/10 px-2 py-1 text-xs text-violet-300">
                      {activeProblem.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      {activeProblem.difficulty}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{activeProblem.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {activeProblem.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <div className="flex gap-2">
                    {["Code", "Test Results"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-lg px-3 py-2 text-xs ${
                          activeTab === tab
                            ? "bg-white/10 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="rounded-lg border border-white/10 bg-[#191925] px-3 py-2 text-xs outline-none focus:border-violet-500"
                  >
                    <option>Java</option>
                    <option>Python</option>
                    <option>C++</option>
                  </select>
                </div>

                {activeTab === "Code" ? (
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                      <span>main.{language === "Java" ? "java" : language === "Python" ? "py" : "cpp"}</span>
                      <span>Editable code</span>
                    </div>

                    <CodeEditor
  code={code}
  language={language}
  onChange={setCode}
/>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={runDemo}
                        className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
                      >
                        ▶ Run demo
                      </button>
                      <button
                        onClick={() => {
                          setShowHint(true);
                          setActiveTab("Code");
                        }}
                        className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/5"
                      >
                        ✳ Get AI hint
                      </button>
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Demo interface only. Code execution will be connected to a
                      sandbox in a later implementation step.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-5">
                    {hasRun ? (
                      <>
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
  {executionResult?.loading ? (
    <p className="text-sm text-violet-300">
      ⏳ Running your code...
    </p>
  ) : executionResult?.error ? (
    <>
      <p className="font-semibold text-red-400">
        ❌ Execution Error
      </p>
      <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-red-300">
        {executionResult.error}
      </pre>
    </>
  ) : executionResult ? (
    <>
     <p
  className={`font-semibold ${
    executionResult.passed
      ? "text-emerald-400"
      : "text-red-400"
  }`}
>
  {executionResult.passed
    ? "✅ Test Passed!"
    : "❌ Test Failed!"}
</p>
<div className="mt-4 space-y-3">
 {executionResult.results && (
  <div className="mt-4 space-y-4">
    <p className="font-semibold text-slate-200">
      Test Results: {executionResult.passedCount}/
      {executionResult.totalCount} Passed
    </p>

    {executionResult.results.map(
      (testCase: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
        error?: string | null;
      }, index: number) => (
        <div
          key={index}
          className="rounded-lg border border-white/10 bg-black/20 p-3"
        >
          <p className="font-semibold text-slate-200">
            Test Case {index + 1}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Input: {testCase.input}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Expected Output
          </p>
          <pre className="whitespace-pre-wrap text-violet-300">
            {testCase.expectedOutput}
          </pre>

          <p className="mt-2 text-sm text-slate-400">
            Actual Output
          </p>
          <pre className="whitespace-pre-wrap text-white">
            {testCase.actualOutput || testCase.error || "No output returned"}
          </pre>

          <p
            className={
              testCase.passed
                ? "mt-3 font-semibold text-emerald-400"
                : "mt-3 font-semibold text-red-400"
            }
          >
            {testCase.passed ? "✅ Passed" : "❌ Failed"}
          </p>
        </div>
      )
    )}
  </div>
)}
</div>

      <p className="mt-4 text-sm font-semibold text-slate-300">
        Output
      </p>

      <pre className="mt-2 min-h-20 whitespace-pre-wrap break-words rounded-lg bg-black/30 p-3 text-sm text-slate-200">
        {executionResult.results?.[0]?.actualOutput ??
  executionResult.output ??
  executionResult.stdout ??
  executionResult.stdout_text ??
  executionResult.stderr ??
  "Execution finished. No output returned."}
      </pre>

      {executionResult.error && (
        <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-red-400">
          {executionResult.error}
        </pre>
      )}
    </>
  ) : (
    <>
      <p className="font-semibold text-slate-200">
        Ready to Run
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Click Run Demo to execute your code and view the output here.
      </p>
    </>
  )}
</div>

                        <div className="rounded-xl border border-white/10 p-4">
                          <p className="text-sm font-semibold">Suggested next step</p>
                          <p className="mt-2 text-sm text-slate-400">
                            Connect a sandbox to compile and execute the selected
                            language before showing real pass/fail results.
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400">
                        Run the demo or request a hint to see this panel update.
                      </p>
                    )}

                    {showHint && (
                      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
                        <p className="font-semibold text-violet-300">
                          ✳ Debugging hint
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {activeProblem.hint}
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                          This is a predefined example hint, not an AI-generated response.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <footer className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
              AI Debugging Arena · Built to help developers learn, one bug at a time.
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}