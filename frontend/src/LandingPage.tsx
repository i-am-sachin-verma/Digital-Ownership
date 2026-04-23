import { useState, useEffect } from "react"
import reactLogo from "./assets/react.svg"
import viteLogo from "./assets/vite.svg"
import heroImg from "./assets/hero.png"

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)
const Bolt = () => <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const PeopleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const Heart = () => <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
const Github = () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
const Discord = () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
const XIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
const Bluesky = () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>

const LandingPage = () => {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  )

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <svg width="26" height="26" viewBox="0 0 410 404" fill="none">
            <path d="M399.641 59.525L215.643 388.545c-3.799 6.793-13.559 6.833-17.415.073L10.582 59.525c-4.2-7.334 2.099-16.293 10.447-14.76l184.195 32.906a13.88 13.88 0 0 0 4.553 0l180.496-32.84c8.303-1.563 14.664 7.325 10.368 14.694z" fill="url(#va)"/>
            <path d="M292.965 1.574L156.801 28.255a5.023 5.023 0 0 0-4.03 4.611l-8.376 141.464c-.197 3.332 2.863 5.918 6.115 5.168l37.91-8.749c3.547-.818 6.752 2.179 6.023 5.74l-11.263 55.286c-.758 3.712 2.727 6.744 6.352 5.7l23.502-6.677c3.629-1.045 7.117 1.993 6.352 5.707l-17.491 85.691c-1.024 4.996 5.799 7.662 8.704 3.432l2.348-3.376L323.102 82.163c1.823-3.933-1.401-8.347-5.686-7.514l-38.979 7.783c-3.643.713-6.772-2.517-5.651-6.067l21.112-68.296c1.123-3.554-2.007-6.784-5.651-6.067z" fill="url(#vb)"/>
            <defs>
              <linearGradient id="va" x1="6" y1="33" x2="235" y2="344" gradientUnits="userSpaceOnUse"><stop stopColor="#41D1FF"/><stop offset="1" stopColor="#BD34FE"/></linearGradient>
              <linearGradient id="vb" x1="194.651" y1="8.818" x2="236.076" y2="292.989" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3CAC"/><stop offset="1" stopColor="#784BA0"/></linearGradient>
            </defs>
          </svg>
          Digital Ownership
          <span className="nav-tag">v1.0.0</span>
        </div>
        <ul className="nav-links">
          <li><a href="#">Docs</a></li>
          <li><a href="#">Guide</a></li>
          <li><a href="#">Contracts</a></li>
          <li><a href="#">Resources</a></li>
        </ul>
        <div className="nav-right">
          <div className="theme-toggle">
            <button className={"theme-btn" + (theme === "light" ? " active" : "")} onClick={() => setTheme("light")} aria-label="Light mode"><Sun /></button>
            <button className={"theme-btn" + (theme === "dark" ? " active" : "")} onClick={() => setTheme("dark")} aria-label="Dark mode"><Moon /></button>
          </div>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-img-wrap">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React" />
          <img src={viteLogo} className="vite-logo" alt="Vite" />
        </div>
        <h1 className="hero-title">Get started</h1>
        <p className="hero-sub">Lightning fast frontend tooling for the next generation web.</p>
        <p className="hero-edit">
          Edit <code>src/App.jsx</code> and save to test
          <span className="hmr-badge">HMR</span>
          <span className="hmr-check">&#10003;</span>
        </p>
        <button className="counter-btn" onClick={() => setCount(c => c + 1)}>
          <Bolt /> Count is {count}
        </button>
      </section>

      <div className="ticks" />

      <section className="cards-section">
        <div className="card">
          <div className="card-icon"><BookIcon /></div>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul className="link-list">
            <li><a className="link-btn" href="https://vite.dev/" target="_blank" rel="noreferrer"><img src={viteLogo} alt="" width="16" height="16" /> Explore Vite <span className="arrow">&#8250;</span></a></li>
            <li><a className="link-btn" href="https://react.dev/" target="_blank" rel="noreferrer"><img src={reactLogo} alt="" width="16" height="16" /> Learn more <span className="arrow">&#8250;</span></a></li>
          </ul>
        </div>
        <div className="card">
          <div className="card-map" aria-hidden="true" />
          <div className="card-icon"><PeopleIcon /></div>
          <h2>Connect with us</h2>
          <p>Join the community</p>
          <ul className="link-list">
            <li><a className="link-btn" href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer"><Github /> GitHub</a></li>
            <li><a className="link-btn" href="https://chat.vite.dev/" target="_blank" rel="noreferrer"><Discord /> Discord</a></li>
            <li><a className="link-btn" href="https://x.com/vite_js" target="_blank" rel="noreferrer"><XIcon /> X.com</a></li>
            <li><a className="link-btn" href="https://bsky.app/profile/vite.dev" target="_blank" rel="noreferrer"><Bluesky /> Bluesky</a></li>
          </ul>
        </div>
      </section>

      <div className="ticks" />

      <footer className="footer">
        Made with <span className="heart"><Heart /></span> by the community
      </footer>
    </>
  )
}

export default LandingPage
