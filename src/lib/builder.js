import { GAME_TYPES } from "../data/catalog";
import { BUILTIN_PACKS } from "../data/packs";
import { shuffle } from "./fun";

const ARCADE = new Set(["mole", "dash", "balloon"]);

export function setupKind(type) {
  if (type === "choice" || type === "fill" || type === "bushou") return "quiz";
  if (type === "listen") return "listen";
  if (type === "match" || type === "memory" || type === "roots") return "pair";
  if (type === "order") return "order";
  if (ARCADE.has(type)) return "target";
  if (type === "odd" || type === "family") return "odd";
  if (type === "hunt") return "hunt";
  return "quiz";
}

export function emptyRow(type) {
  const kind = setupKind(type);
  if (kind === "quiz") return { q: "", options: ["", "", "", ""], answer: 0 };
  if (kind === "listen") return { speak: "", wrong: ["", "", ""] };
  if (kind === "pair") return { left: "", right: "" };
  if (kind === "order") return { word: "", hint: "" };
  if (kind === "target") return { target: "", decoys: ["", "", ""] };
  if (kind === "odd") return { options: ["", "", "", ""], answer: 0, why: "" };
  return { radical: "", mark: "", answers: ["", "", ""], decoys: ["", "", "", "", "", ""] };
}

export function labelsFor(type) {
  const meta = GAME_TYPES.find((item) => item.id === type);
  const kind = setupKind(type);
  if (kind === "quiz") {
    return {
      title: "選擇題",
      help: "寫題目，填四個選項，再點一下哪一個是正確答案。",
      q: type === "fill" ? "句子（缺的地方用＿）" : type === "bushou" ? "題目，例如：河的部首是？" : "題目",
      option: "選項",
    };
  }
  if (kind === "listen") {
    return { title: "聽一聽", help: "填會唸出來的正確詞，再填三個會來搗蛋的詞。", speak: "正確的詞（會唸出來）", wrong: "搗蛋詞" };
  }
  if (kind === "pair") {
    return {
      title: "配對",
      help: type === "roots" ? "左邊填字，右邊填部首。" : "左邊和右邊各填一個，讓孩子把它們配在一起。",
      left: type === "roots" ? "字" : "左邊",
      right: type === "roots" ? "部首" : "右邊",
    };
  }
  if (kind === "order") {
    return { title: "排字", help: "填正確的詞或句子，提示可以讓孩子比較好猜。", word: "正確的詞", hint: "提示（可以空白）" };
  }
  if (kind === "target") {
    return {
      title: meta?.name || "動態關卡",
      help: "填孩子要接／打中／戳破／撈到的字，再填三個會跑出來搗蛋的字。",
      target: "正確的字",
      decoy: "搗蛋字",
    };
  }
  if (kind === "odd") {
    return {
      title: type === "family" ? "部首一家人" : "找不同",
      help: "填四個字，點出哪一個跟大家不一樣。最後可以寫為什麼。",
      option: "選項",
      why: "為什麼不一樣（可以空白）",
    };
  }
  return {
    title: "部首獵人",
    help: "填部首，再填三個正確的字、六個搗蛋字。會變成九宮格給孩子找。",
    radical: "部首名稱，例如：水",
    mark: "部首樣子，例如：氵（可以空白）",
    answer: "正確的字",
    decoy: "搗蛋字",
  };
}

function filled(text) {
  return String(text || "").trim();
}

export function rowReady(type, row) {
  const kind = setupKind(type);
  if (kind === "quiz") return filled(row.q) && row.options.filter(filled).length >= 2;
  if (kind === "listen") return filled(row.speak) && row.wrong.filter(filled).length >= 1;
  if (kind === "pair") return filled(row.left) && filled(row.right);
  if (kind === "order") return filled(row.word);
  if (kind === "target") return filled(row.target) && row.decoys.filter(filled).length >= 1;
  if (kind === "odd") return row.options.filter(filled).length >= 3;
  return filled(row.radical) && row.answers.filter(filled).length >= 2 && row.decoys.filter(filled).length >= 2;
}

export function payloadFromRows(title, grade, type, rows) {
  const ready = rows.filter((row) => rowReady(type, row));
  if (!ready.length) return null;
  const kind = setupKind(type);
  const base = { title: filled(title) || "我的中文關卡", grade, type };

  if (kind === "pair") {
    return { ...base, pairs: ready.map((row) => ({ left: filled(row.left), right: filled(row.right) })) };
  }
  if (kind === "order") {
    return { ...base, items: ready.map((row) => ({ word: filled(row.word), hint: filled(row.hint) || "排出正確順序" })) };
  }
  if (kind === "target") {
    const promptMap = {
      mole: (word) => `打出「${word}」！`,
      balloon: (word) => `戳破「${word}」！`,
      dash: (word) => `衝去接「${word}」！`,
    };
    const makePrompt = promptMap[type] || promptMap.mole;
    return {
      ...base,
      items: ready.map((row) => ({
        target: filled(row.target),
        decoys: row.decoys.map(filled).filter(Boolean),
        prompt: makePrompt(filled(row.target)),
      })),
    };
  }
  if (kind === "hunt") {
    return {
      ...base,
      items: ready.map((row) => {
        const answers = row.answers.map(filled).filter(Boolean);
        const decoys = row.decoys.map(filled).filter(Boolean);
        const radical = filled(row.radical);
        return {
          radical,
          mark: filled(row.mark) || radical,
          hint: `找出「${radical}」部的字`,
          picks: [...answers, ...decoys],
          answers,
        };
      }),
    };
  }
  if (kind === "odd") {
    return {
      ...base,
      items: ready.map((row) => {
        const raw = row.options.map(filled);
        const chosen = raw[Number(row.answer)] || raw.find(Boolean);
        const options = raw.map((option) => option || "？");
        return {
          options,
          answer: Math.max(0, options.indexOf(chosen)),
          why: filled(row.why) || "它跟其他的不一樣",
        };
      }),
    };
  }
  if (kind === "listen") {
    return {
      ...base,
      items: ready.map((row) => {
        const speak = filled(row.speak);
        const options = shuffle([speak, ...row.wrong.map(filled).filter(Boolean)].slice(0, 4));
        return { speak, options, answer: Math.max(0, options.indexOf(speak)) };
      }),
    };
  }
  return {
    ...base,
    items: ready.map((row) => {
      const raw = row.options.map(filled);
      const chosen = raw[Number(row.answer)] || raw.find(Boolean);
      const options = raw.filter(Boolean).slice(0, 4);
      return {
        q: filled(row.q),
        options,
        answer: Math.max(0, options.indexOf(chosen)),
      };
    }),
  };
}

export function rowsFromGame(game) {
  const type = game.type;
  const kind = setupKind(type);
  if (kind === "pair") {
    return (game.pairs || []).map((pair) => ({ left: pair.left || "", right: pair.right || "" }));
  }
  const items = game.items || [];
  if (kind === "order") return items.map((item) => ({ word: item.word || "", hint: item.hint || "" }));
  if (kind === "target") {
    return items.map((item) => ({
      target: item.target || "",
      decoys: [...(item.decoys || []), "", "", ""].slice(0, 3),
    }));
  }
  if (kind === "hunt") {
    return items.map((item) => ({
      radical: item.radical || "",
      mark: item.mark || "",
      answers: [...(item.answers || []), "", "", ""].slice(0, 3),
      decoys: [...(item.decoys || (item.picks || []).filter((char) => !(item.answers || []).includes(char))), "", "", "", "", "", ""].slice(0, 6),
    }));
  }
  if (kind === "odd") {
    return items.map((item) => ({
      options: [...(item.options || []), "", "", "", ""].slice(0, 4),
      answer: item.answer || 0,
      why: item.why || "",
    }));
  }
  if (kind === "listen") {
    return items.map((item) => {
      const options = item.options || [];
      const correct = options[item.answer] || item.speak || "";
      return {
        speak: item.speak || correct,
        wrong: options.filter((option) => option !== correct).concat(["", "", ""]).slice(0, 3),
      };
    });
  }
  return items.map((item) => ({
    q: item.q || "",
    options: [...(item.options || []), "", "", "", ""].slice(0, 4),
    answer: item.answer || 0,
  }));
}

export function rowsFromBuiltin(grade, type) {
  const pack = BUILTIN_PACKS[grade]?.[type] || (ARCADE.has(type) ? BUILTIN_PACKS[grade]?.mole : null);
  if (!pack) return [emptyRow(type), emptyRow(type), emptyRow(type)];
  if (setupKind(type) === "pair") {
    return pack.map(([left, right]) => ({ left, right }));
  }
  return rowsFromGame({ type, items: pack, pairs: pack });
}

export function countReady(type, rows) {
  return rows.filter((row) => rowReady(type, row)).length;
}
