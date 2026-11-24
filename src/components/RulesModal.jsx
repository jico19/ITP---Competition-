import Modal from './Modal'

export default function RulesModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="# Competition Rules"
      description="Guidelines and scoring criteria for the live coding competition."
      size="lg"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg hover:shadow-hard-sm"
          >
            $ close
          </button>
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs leading-6 text-fg">
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-fg border-b border-line pb-1">
            &gt; 01. Solving Challenges
          </h3>
          <p className="mt-2 text-fg-muted">
            • Python challenges are executed in your browser via Pyodide. You can code in VS Code and paste your solution into the app editor, or write it directly.
          </p>
          <p className="mt-1 text-fg-muted">
            • Web challenges are evaluated by an event judge based on the rubric.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-fg border-b border-line pb-1">
            &gt; 02. Testing & Submissions
          </h3>
          <p className="mt-2 text-fg-muted">
            • Click <strong>Run tests</strong> to execute test cases. Visible tests show expected vs actual output; hidden tests report pass or fail.
          </p>
          <p className="mt-1 text-fg-muted">
            • A 5-second execution timeout applies per run. Infinite loops will terminate automatically.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-fg border-b border-line pb-1">
            &gt; 03. Scoring & Leaderboard
          </h3>
          <p className="mt-2 text-fg-muted">
            • Your score reflects your best submission per challenge.
          </p>
          <p className="mt-1 text-fg-muted">
            • The first player in a room to fully solve a challenge earns a First Solve bonus (+5 pts).
          </p>
          <p className="mt-1 text-fg-muted">
            • Live standings are broadcast on the room TV display.
          </p>
        </section>
      </div>
    </Modal>
  )
}
