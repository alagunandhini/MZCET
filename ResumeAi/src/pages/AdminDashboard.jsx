import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Users,
  CheckCircle2,
  Trophy,
  Radio,
  ArrowUpDown,
  Lock,
  XCircle,
  CircleDashed,
} from "lucide-react";
import { API_URL } from "../config";

const ROUND_KEYS = ["Round1", "Round2", "Round3", "Round4"];
const ROUND_LABELS = { Round1: "Round 1", Round2: "Round 2", Round3: "Round 3", Round4: "Round 4" };

const roundsCompleted = (student) =>
  ROUND_KEYS.filter(
    (r) => student.rounds?.[r]?.score !== null && student.rounds?.[r]?.score !== undefined
  ).length;

const overallAverage = (student) => {
  const scored = ROUND_KEYS.map((r) => student.rounds?.[r]?.score).filter(
    (s) => s !== null && s !== undefined
  );
  if (!scored.length) return null;
  return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
};

const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token");

/* ------------------------------------------------------------------ */

const RoundPill = ({ round, data }) => {
  const attempted = data?.score !== null && data?.score !== undefined;
  if (!attempted) {
    return <div title={`${round}: not attempted`} className="h-2 w-7 rounded-full bg-slate-200" />;
  }
  const pass = data.result?.toLowerCase().includes("pass");
  return (
    <div
      title={`${round}: ${data.score} (${data.result})`}
      className={`h-2 w-7 rounded-full ${pass ? "bg-sky-500" : "bg-slate-400"}`}
    />
  );
};

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sky-500 opacity-10" />
    <div className="relative flex items-center gap-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tracking-tight text-slate-800 leading-none">{value}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  </div>
);

/**
 * Derives a human-readable round status without requiring any new API calls.
 * Falls back sensibly if attemptsUsed/maxAttempts aren't present in the payload yet.
 */
const getRoundStatus = (roundData, prevRoundData, isFirstRound) => {
  const hasScore = roundData?.score !== null && roundData?.score !== undefined;

  if (hasScore) {
    const pass = roundData.result?.toLowerCase().includes("pass");
    return { label: pass ? "PASS" : "FAIL", pass, locked: false, started: true };
  }

  // Not first round and previous round wasn't passed -> locked
  if (!isFirstRound) {
    const prevHasScore = prevRoundData?.score !== null && prevRoundData?.score !== undefined;
    const prevPass = prevRoundData?.result?.toLowerCase().includes("pass");
    if (!prevHasScore || !prevPass) {
      return { label: "LOCKED", pass: false, locked: true, started: false };
    }
  }

  return { label: "NOT STARTED", pass: false, locked: false, started: false };
};

const RoundStatusIcon = ({ status }) => {
  if (status.locked) return <Lock className="h-3.5 w-3.5 text-slate-400" />;
  if (status.started && status.pass) return <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />;
  if (status.started && !status.pass) return <XCircle className="h-3.5 w-3.5 text-slate-500" />;
  return <CircleDashed className="h-3.5 w-3.5 text-slate-400" />;
};

const RoundSummaryCard = ({ roundKey, data, prevData, isFirstRound }) => {
  const status = getRoundStatus(data, prevData, isFirstRound);
  const attemptsUsed = data?.attemptsUsed ?? data?.attempts ?? null;
  const maxAttempts = data?.maxAttempts ?? null;
  const timeTaken = data?.timeTaken ?? data?.duration ?? null;

  const statusColor = status.locked
    ? "border-slate-200 bg-slate-50"
    : status.started
    ? status.pass
      ? "border-sky-200 bg-sky-50/60"
      : "border-slate-300 bg-slate-100/60"
    : "border-slate-200 bg-white";

  return (
    <div className={`rounded-xl border p-3.5 ${statusColor}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-700">{ROUND_LABELS[roundKey]}</p>
        <RoundStatusIcon status={status} />
      </div>
      <div className="space-y-1 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>Attempts</span>
          <span className="font-semibold text-slate-600">
            {attemptsUsed !== null && maxAttempts !== null
              ? `${attemptsUsed} / ${maxAttempts}`
              : attemptsUsed !== null
              ? attemptsUsed
              : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Status</span>
          <span
            className={`font-semibold ${
              status.locked
                ? "text-slate-400"
                : status.started
                ? status.pass
                  ? "text-sky-600"
                  : "text-slate-500"
                : "text-slate-400"
            }`}
          >
            {status.label}
          </span>
        </div>
        {data?.score !== null && data?.score !== undefined && (
          <div className="flex items-center justify-between">
            <span>Best Score</span>
            <span className="font-semibold text-slate-600">{data.score}%</span>
          </div>
        )}
        {timeTaken && (
          <div className="flex items-center justify-between">
            <span>Time Taken</span>
            <span className="font-semibold text-slate-600">{timeTaken}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // NEW: tracks which student row (by registerNumber) is currently expanded
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    if (!getToken()) navigate("/admin-login");
  }, [navigate]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = getToken();
        const [deptRes, yearRes] = await Promise.all([
          axios.get(`${API_URL}/admin/departments`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/years`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setDepartments(deptRes.data.departments || []);
        setYears(yearRes.data.years || []);
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/admin/students`, {
          params: { department: selectedDepartment, year: selectedYear },
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Failed to fetch students", err);
        setError("Couldn't load student data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedDepartment, selectedYear]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = students.filter((s) => {
      if (!q) return true;
      return s.name?.toLowerCase().includes(q) || s.registerNumber?.toLowerCase().includes(q);
    });

    list = [...list].sort((a, b) => {
      let av, bv;
      if (sortKey === "progress") { av = roundsCompleted(a); bv = roundsCompleted(b); }
      else if (sortKey === "average") { av = overallAverage(a) ?? -1; bv = overallAverage(b) ?? -1; }
      else { av = a.name || ""; bv = b.name || ""; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [students, searchQuery, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // CHANGED: navigation is now only triggered from the "View Full Details" button
  const goToStudent = (registerNumber) => {
    navigate(`/admin/students/${registerNumber}`);
  };

  // NEW: toggles the expanded summary panel for a row
  const toggleExpand = (registerNumber) => {
    setExpandedRow((prev) => (prev === registerNumber ? null : registerNumber));
  };

  const totalStudents = students.length;
  const completedAll = students.filter((s) => roundsCompleted(s) === ROUND_KEYS.length).length;
  const onlineNow = students.filter((s) => s.loggedIn).length;
  const averages = students.map(overallAverage).filter((v) => v !== null);
  const avgScoreAll = averages.length ? Math.round(averages.reduce((a, b) => a + b, 0) / averages.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes expandPanel {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .expand-panel {
          animation: expandPanel 0.22s ease-out;
        }
        .chevron-rotate {
          transition: transform 0.2s ease;
        }
      `}</style>

      {/* Header */}
      <div className="bg-sky-900">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-7 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">
              Placement &amp; Assessment Cell
            </p>
            <h1
              className="text-2xl md:text-[28px] font-extrabold text-white tracking-tight mt-1"
              style={{ fontFamily: "'Manrope', ui-sans-serif" }}
            >
              Student Progress Dashboard
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-slate-200 backdrop-blur">
            <Radio className="h-3.5 w-3.5 text-sky-400" />
            Live data
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-10 -mt-6 pb-10">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard icon={Users} label="Total Students" value={totalStudents} />
          <StatCard icon={CheckCircle2} label="Completed All Rounds" value={completedAll} sub={totalStudents ? `of ${totalStudents}` : undefined} />
          <StatCard icon={Trophy} label="Average Score" value={`${avgScoreAll}%`} />
          <StatCard icon={Radio} label="Currently Online" value={onlineNow} />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="All">All Years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or register no."
              className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_14px_rgba(15,23,42,0.05)] overflow-hidden">
          {loading ? (
            <div className="p-14 text-center text-slate-400 text-sm">Loading students…</div>
          ) : error ? (
            <div className="p-14 text-center text-slate-500 text-sm">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-14 text-center text-slate-400 text-sm">
              {searchQuery ? "No students match your search." : "No students found for this filter."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-200">
                  <tr>
                    <th className="w-8"></th>
                    <th className="px-4 py-3 font-bold">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-slate-800">
                        Student <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Dept / Year</th>
                    <th className="px-4 py-3 font-bold">
                      <button onClick={() => toggleSort("progress")} className="flex items-center gap-1 hover:text-slate-800">
                        Round Progress <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-bold text-center">
                      <button onClick={() => toggleSort("average")} className="flex items-center gap-1 mx-auto hover:text-slate-800">
                        Avg. Score <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, i) => {
                    const avg = overallAverage(student);
                    const done = roundsCompleted(student);
                    const isExpanded = expandedRow === student.registerNumber;
                    const initials = (student.name || "?")
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <>
                        <tr
                          key={student.registerNumber}
                          onClick={() => toggleExpand(student.registerNumber)}
                          className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                            isExpanded ? "bg-slate-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                          }`}
                        >
                          <td className="pl-4">
                            <ChevronRight
                              className={`h-4 w-4 text-slate-400 chevron-rotate ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-white text-[11px] font-bold shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 leading-tight">{student.name}</p>
                                <p className="text-[11px] text-slate-400 leading-tight">{student.registerNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                            <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                              {student.department}
                            </span>
                            <span className="ml-2 text-xs text-slate-400">Year {student.year}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {ROUND_KEYS.map((r) => <RoundPill key={r} round={r} data={student.rounds?.[r]} />)}
                              <span className="ml-2 text-xs text-slate-400">{done}/4</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            {avg === null ? (
                              <span className="text-slate-300">—</span>
                            ) : (
                              <span className={`font-bold ${avg >= 40 ? "text-sky-600" : "text-slate-500"}`}>{avg}%</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                student.loggedIn ? "bg-sky-50 text-sky-600" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${student.loggedIn ? "bg-sky-500" : "bg-slate-400"}`} />
                              {student.loggedIn ? "Online" : "Offline"}
                            </span>
                          </td>
                        </tr>

                        {/* NEW: expandable summary row */}
                        {isExpanded && (
                          <tr className="border-b border-slate-100 bg-slate-50/60">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="expand-panel">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                  {ROUND_KEYS.map((r, idx) => (
                                    <RoundSummaryCard
                                      key={r}
                                      roundKey={r}
                                      data={student.rounds?.[r]}
                                      prevData={idx > 0 ? student.rounds?.[ROUND_KEYS[idx - 1]] : null}
                                      isFirstRound={idx === 0}
                                    />
                                  ))}
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      goToStudent(student.registerNumber);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
                                  >
                                    View Full Details
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Showing {filteredStudents.length} of {totalStudents} students &middot; click a row to view round-by-round summary
        </p>
      </div>
    </div>
  );
}