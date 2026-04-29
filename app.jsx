// Main App — orchestrates the 11 screens

const SCREENS = [
{ id: "1.1", title: "Welcome", time: "0:00", mode: "static", phase: "Open" },
{ id: "1.2", title: "\"If Only\" generator", time: "0:00", mode: "interactive", phase: "Open" },
{ id: "1.3", title: "The Bridge", time: "5:00", mode: "listen", phase: "Open" },
{ id: "2.1", title: "My story, turned around", time: "8:00", mode: "interactive", phase: "Quiet Reflection" },
{ id: "2.2", title: "The core want", time: "10:00", mode: "interactive", phase: "Quiet Reflection" },
{ id: "3.1", title: "Breakout 1 · pre-thinking", time: "13:00", mode: "static", phase: "Breakout 1" },
{ id: "3.2", title: "Breakout 1 · capture", time: "25:00", mode: "interactive", phase: "Breakout 1" },
{ id: "4.1", title: "Breakout 2 · diagnostic", time: "27:00", mode: "interactive", phase: "Breakout 2" },
{ id: "4.2", title: "Breakout 2 · capture", time: "37:00", mode: "interactive", phase: "Breakout 2" },
{ id: "5.1", title: "Whole-group discussion", time: "37:00", mode: "listen", phase: "Discussion" },
{ id: "6.1", title: "Commitment", time: "42:00", mode: "interactive", phase: "Close" }];


const FACILITATOR_CUES = {
  "1.1": "Keep this open throughout the session.",
  "1.2": "Open your screen and fill in the sentence. Be honest, be petty, be ridiculous.",
  "1.3": "Look up for a minute. I'm going to connect the dots.",
  "2.1": "5 minutes of quiet. Cameras off if you want. No one sees this but you.",
  "2.2": "Stay with it. Go a little deeper.",
  "3.1": "Take 30 seconds, then we'll go into breakouts.",
  "3.2": "Welcome back. 30 seconds to capture what just happened.",
  "4.1": "Read through, select your diagnosis, then back to breakouts.",
  "4.2": "Welcome back. Capture one thing before whole-group.",
  "5.1": "Look up. Let's talk.",
  "6.1": "Last screen. One commitment. Drop it in chat too."
};

const MODE_LABEL = {
  static: "Listen / Read",
  listen: "Listen Mode",
  interactive: "Your turn — write"
};

function Rail({ idx, set, visited }) {
  const phases = [];
  let last = null;
  SCREENS.forEach((s, i) => {
    if (s.phase !== last) {
      phases.push({ phase: s.phase, items: [] });
      last = s.phase;
    }
    phases[phases.length - 1].items.push({ ...s, i });
  });

  return (
    <aside className="rail">
      <div className="rail-brand">Session 9</div>
      <div className="rail-sub">Reframing reality</div>

      {phases.map((p) =>
      <React.Fragment key={p.phase}>
          <div className="rail-section">{p.phase}</div>
          {p.items.map((item) =>
        <button key={item.id} className="rail-item"
        data-active={idx === item.i}
        data-visited={visited[item.i] && idx !== item.i}
        onClick={() => set(item.i)}>
              <span className="rail-num">{item.id}</span>
              <span className="rail-title">{item.title}</span>
              <span className="rail-time">{item.time}</span>
            </button>
        )}
        </React.Fragment>
      )}

      <div className="rail-foot" style={{ fontSize: "12px" }}>
        45-min live session<br />
        Zoom + companion · Managers
      </div>
    </aside>);

}

function StatusBar({ idx }) {
  const screen = SCREENS[idx];
  return (
    <div className="status">
      <span className="status-mode" data-mode={screen.mode}>
        <span className="status-dot" />
      </span>
      <span style={{ minWidth: 110 }}>{screen.id} · {MODE_LABEL[screen.mode]}</span>
      <span className="status-progress">
        {SCREENS.map((_, i) =>
        <span key={i} className="status-tick"
        data-state={i === idx ? "active" : i < idx ? "visited" : "pending"} />
        )}
      </span>
      <span className="status-cue">*{FACILITATOR_CUES[screen.id]}</span>
    </div>);

}

function App() {
  const [idx, setIdx] = React.useState(() => {
    const saved = localStorage.getItem("s9_idx");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [state, setState] = React.useState(() => {
    try {return JSON.parse(localStorage.getItem("s9_state") || "{}");}
    catch {return {};}
  });

  React.useEffect(() => {localStorage.setItem("s9_idx", String(idx));}, [idx]);
  React.useEffect(() => {localStorage.setItem("s9_state", JSON.stringify(state));}, [state]);

  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const next = () => setIdx((i) => Math.min(i + 1, SCREENS.length - 1));

  // Visited screens (for rail visual)
  const visited = {};
  for (let i = 0; i <= idx; i++) visited[i] = true;

  // Persistent reminder strip — shows after warm-up
  const showStrip = idx > 1 && state.coreWant && idx < 10;

  const screenProps = { next, state, set };
  const screenById = {
    0: <Screen_1_1 {...screenProps} />,
    1: <Screen_1_2 {...screenProps} />,
    2: <Screen_1_3 {...screenProps} />,
    3: <Screen_2_1 {...screenProps} />,
    4: <Screen_2_2 {...screenProps} />,
    5: <Screen_3_1 {...screenProps} />,
    6: <Screen_3_2 {...screenProps} />,
    7: <Screen_4_1 {...screenProps} />,
    8: <Screen_4_2 {...screenProps} />,
    9: <Screen_5_1 {...screenProps} />,
    10: <Screen_6_1 {...screenProps} />
  };

  return (
    <div className="app">
      <Rail idx={idx} set={setIdx} visited={visited} />
      <main className="stage" data-screen-label={`${SCREENS[idx].id} ${SCREENS[idx].title}`}>
        <StatusBar idx={idx} />
        <div key={idx}>{screenById[idx]}</div>
        {showStrip &&
        <div className="persisted">
            you're holding <span className="pill">{state.coreWant}</span>
          </div>
        }
      </main>
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);