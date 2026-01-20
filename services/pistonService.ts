
export interface PistonFile {
  name: string;
  content: string;
}

export interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  c: { language: 'c', version: '10.2.1' },
  cpp: { language: 'cpp', version: '10.2.1' },
};

export const executeCode = async (languageKey: string, files: PistonFile[]): Promise<PistonResponse> => {
  const lang = LANGUAGE_MAP[languageKey];
  if (!lang) throw new Error("Unsupported language");

  const response = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang.language,
      version: lang.version,
      files: files,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to execute code");
  }

  return response.json();
};
