export const PYTHON_HARNESS = `
import io, sys, json

def _norm(text):
    if text is None:
        return ""
    parts = str(text).replace("\\r\\n", "\\n").replace("\\r", "\\n").split("\\n")
    return "\\n".join(p.rstrip() for p in parts).rstrip()

def _reader(text):
    lines = iter(str(text).splitlines())
    def read(prompt=None):
        try:
            return next(lines)
        except StopIteration:
            raise EOFError("EOF when reading a line")
    return read

def _error_line(exc):
    tb = exc.__traceback__
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == "<player>":
            return tb.tb_lineno
        tb = tb.tb_next
    if isinstance(exc, SyntaxError) and exc.filename == "<player>":
        return exc.lineno
    return None

def _run_one(payload):
    code = payload["code"]
    call = payload.get("call")
    expected = payload.get("expected") or ""
    visible = bool(payload.get("visible"))
    g = {"__name__": "__main__"}
    if "stdin" in payload:
        g["input"] = _reader(payload["stdin"] or "")
    out = io.StringIO()
    previous = sys.stdout
    sys.stdout = out
    result = {"passed": False, "visible": visible}
    try:
        exec(compile(code, "<player>", "exec"), g)
        got = repr(eval(call, g)) if call else out.getvalue()
        result["stdout"] = out.getvalue()
        result["got"] = got
        result["expected"] = expected
        result["passed"] = _norm(got) == _norm(expected)
    except BaseException as exc:
        result["error"] = type(exc).__name__ + ": " + str(exc)
        line = _error_line(exc)
        if line is not None:
            result["line"] = line
    finally:
        sys.stdout = previous
    if not visible:
        return {"passed": result["passed"], "visible": False}
    return result

def _run_from_payload():
    payload = json.loads(globals()["_payload"])
    return json.dumps(_run_one(payload))
`
