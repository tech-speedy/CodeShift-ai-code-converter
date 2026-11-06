import { useState, useEffect, useRef } from "react";
import {
  ArrowRightLeft, ArrowUpRight, Braces, Check, CheckCircle2, ChevronDown,
  Clipboard, Code2, Download, Github, LoaderCircle, Play, RotateCcw,
  ShieldCheck, Sparkles, Terminal, WandSparkles, AlertCircle, Zap
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import "./index.css";

const DEFAULT_CODE = `function helloWorld() {\n  console.log("Hello, world!");\n}`;
const LANGUAGES = ["Python", "Java", "C++", "C#", "Go", "Rust", "TypeScript", "Kotlin", "Swift", "PHP", "Ruby", "JavaScript"];
const EXTENSIONS = { Python: "py", Java: "java", "C++": "cpp", "C#": "cs", Go: "go", Rust: "rs", TypeScript: "ts", Kotlin: "kt", Swift: "swift", PHP: "php", Ruby: "rb", JavaScript: "js" };

const extractReply = (res) => {
  if (typeof res === "string") return res;
  const content = res?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => typeof part === "string" ? part : part?.text ?? "").join("\n");
  return res?.text ?? "";
};
const stripFences = (text) => {
  const match = text.match(/```[\w+#.-]*\s*\n([\s\S]*?)```/);
  return (match ? match[1] : text).trim();
};

export default function App() {
  const [aiReady, setAiReady] = useState(false);
  const [inputCode, setInputCode] = useState(DEFAULT_CODE);
  const [outputCode, setOutputCode] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Python");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [copied, setCopied] = useState(false);
  const feedbackTimer = useRef(null);
  const copyTimer = useRef(null);

  const showFeedback = (type, text, autoClear = false) => {
    clearTimeout(feedbackTimer.current);
    setFeedback({ type, text });
    if (autoClear) feedbackTimer.current = setTimeout(() => setFeedback({ type: "", text: "" }), 3500);
  };

  useEffect(() => {
    if (window.puter?.ai?.chat) setAiReady(true);
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) { setAiReady(true); clearInterval(checkReady); }
    }, 300);
    return () => { clearInterval(checkReady); clearTimeout(feedbackTimer.current); clearTimeout(copyTimer.current); };
  }, []);

  const handleConvert = async () => {
    if (!inputCode.trim()) return showFeedback("error", "Please enter some code to convert.");
    if (!aiReady) return showFeedback("error", "AI is still connecting. Please try again shortly.");
    setLoading(true);
    showFeedback("", "");
    setOutputCode("");
    try {
      const res = await window.puter.ai.chat(`Convert the following code into ${targetLanguage}. Only return the converted code, no explanations.\n\nCode:\n${inputCode}`);
      const reply = stripFences(extractReply(res));
      if (!reply) throw new Error("No response from AI.");
      setOutputCode(reply);
      showFeedback("success", `Successfully converted to ${targetLanguage}!`, true);
    } catch (err) {
      console.error("Conversion error:", err);
      showFeedback("error", `Conversion failed: ${err?.message || err?.error?.message || String(err)}`);
    } finally { setLoading(false); }
  };

  const handleReset = () => { setInputCode(DEFAULT_CODE); setOutputCode(""); setCopied(false); showFeedback("", ""); };
  const handleCopy = async () => {
    if (!outputCode) return;
    try {
      await navigator.clipboard.writeText(outputCode);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
      showFeedback("success", "Code copied to clipboard.", true);
    } catch { showFeedback("error", "Copy failed. Please select the code and copy manually."); }
  };
  const handleDownload = () => {
    if (!outputCode) return;
    const url = URL.createObjectURL(new Blob([outputCode], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `codeshift-output.${EXTENSIONS[targetLanguage] || "txt"}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      <header className="topbar glass-panel">
        <a className="brand" href="#home" aria-label="CodeShift home">
          <span className="brand-icon"><Braces size={23} strokeWidth={2.4} /></span>
          <span>code<span className="brand-accent">shift</span><span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-right">
          <span className="topbar-label"><Sparkles size={14} /> AI-powered developer workspace</span>
          <span className={`connection-pill ${aiReady ? "connected" : "connecting"}`}><span className="status-dot" />{aiReady ? "AI Online" : "Connecting AI"}</span>
        </div>
      </header>

      <main id="home" className="main-content">
        <section className="hero">
          <div className="eyebrow"><span className="eyebrow-sparkle"><Sparkles size={14} /></span> YOUR CODE, ANY LANGUAGE <span className="eyebrow-line" /></div>
          <h1>Translate code.<br /><span className="gradient-text">Without limits.</span></h1>
          <p>Go from idea to implementation in any language. A beautifully simple workspace for AI-powered code conversion.</p>
          <div className="hero-pills"><span><Zap size={14} /> AI-powered</span><span><ShieldCheck size={14} /> Clean output</span><span><Code2 size={14} /> 12 languages</span></div>
        </section>

        <section className="workspace glass-panel" aria-label="Code conversion workspace">
          <div className="workspace-topline">
            <div className="workspace-heading"><span className="workspace-icon"><Terminal size={18} /></span><div><h2>Conversion workspace</h2><p>Your next language is one click away.</p></div></div>
            <div className="workspace-controls">
              <label className="language-select-wrap"><span>CONVERT TO</span><span className="select-control"><select aria-label="Target language" value={targetLanguage} disabled={loading} onChange={(e) => setTargetLanguage(e.target.value)}>{LANGUAGES.map((lang) => <option value={lang} key={lang}>{lang}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></span></label>
              <button className="reset-button" onClick={handleReset} disabled={loading} title="Reset code"><RotateCcw size={16} /><span>Reset</span></button>
              <button className="convert-button" onClick={handleConvert} disabled={!aiReady || loading}><span className="convert-button-shine" />{loading ? <LoaderCircle className="spin" size={18} /> : <WandSparkles size={18} />}<span>{loading ? "Converting..." : aiReady ? "Convert code" : "Connecting..."}</span><ArrowUpRight size={16} /></button>
            </div>
          </div>

          <div className="editor-grid">
            <div className="editor-card"><div className="editor-toolbar"><div className="editor-title"><span className="editor-symbol source-symbol"><Code2 size={16} /></span><div><strong>Source code</strong><span>INPUT</span></div></div><div className="editor-tag">JavaScript / Source</div></div><div className="editor-body"><CodeMirror value={inputCode} height="390px" extensions={[javascript({ jsx: true })]} theme={dracula} onChange={setInputCode} basicSetup={{ lineNumbers: true, foldGutter: true }} aria-label="Source code editor" /></div><div className="editor-footer"><span><span className="footer-dot cyan" /> Editable</span><span>{inputCode.length.toLocaleString()} characters</span></div></div>
            <div className="editor-divider" aria-hidden="true"><span><ArrowRightLeft size={17} /></span></div>
            <div className="editor-card"><div className="editor-toolbar"><div className="editor-title"><span className="editor-symbol result-symbol"><Braces size={16} /></span><div><strong>Converted code</strong><span>OUTPUT · {targetLanguage.toUpperCase()}</span></div></div><div className="output-actions"><button onClick={handleCopy} disabled={!outputCode} title="Copy converted code">{copied ? <Check size={15} /> : <Clipboard size={15} />}<span>{copied ? "Copied" : "Copy"}</span></button><button onClick={handleDownload} disabled={!outputCode} title="Download converted code"><Download size={15} /><span>Save</span></button></div></div><div className="editor-body output-editor">{!outputCode && !loading && <div className="empty-output"><span className="empty-icon"><Sparkles size={26} /></span><strong>Ready when you are</strong><span>Your converted code will appear here.</span></div>}{loading && <div className="empty-output loading-output"><span className="empty-icon"><LoaderCircle className="spin" size={26} /></span><strong>Working some magic...</strong><span>Translating your code to {targetLanguage}.</span></div>}<CodeMirror value={outputCode} height="390px" theme={dracula} readOnly editable={false} basicSetup={{ lineNumbers: true, foldGutter: true }} aria-label="Converted code editor" /></div><div className="editor-footer"><span><span className={`footer-dot ${outputCode ? "green" : "muted"}`} />{outputCode ? "Conversion complete" : "Waiting for conversion"}</span><span>{outputCode.length.toLocaleString()} characters</span></div></div>
          </div>
          <div className="workspace-bottom"><span><ShieldCheck size={15} /> Built for a smoother developer workflow</span><span className="shortcut-hint"><Play size={13} /> Select a language and hit Convert code</span></div>
        </section>

        <div className="feedback-slot" role="status" aria-live="polite">{feedback.text && <div className={`feedback-toast ${feedback.type}`} >{feedback.type === "error" ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}{feedback.text}</div>}</div>
        <section className="features" aria-label="Features"><div><span className="feature-icon purple"><Sparkles size={19} /></span><strong>Intelligent conversion</strong><p>AI understands your code and rewrites it in your target language.</p></div><div><span className="feature-icon blue"><Zap size={19} /></span><strong>Effortless workflow</strong><p>Paste, convert, copy or download. Everything in one place.</p></div><div><span className="feature-icon pink"><Code2 size={19} /></span><strong>Developer focused</strong><p>Syntax-highlighted editors designed to keep you in the flow.</p></div></section>
      </main>
      <footer className="site-footer"><span>© {new Date().getFullYear()} CodeShift. Crafted for developers.</span><span><Github size={15} /> Build something amazing <ArrowUpRight size={13} /></span></footer>
    </div>
  );
}
