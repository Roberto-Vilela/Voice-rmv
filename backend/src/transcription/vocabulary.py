import json
import logging
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

logger = logging.getLogger(__name__)

THEME_DIR = Path("data/themes")
_CACHE_TTL = 86400

FALLBACKS: dict[str, str] = {
    "saude": "estenose, miocárdio, AAS, eptifibatida, hipertrofia, arritmia, síncope, aneurisma, sepse, anafilaxia, diagnóstico, prognóstico, comorbidade, contraindicação, prescrição, administração, irrigação, perfusão, isquemia, necrose",
    "lei": "habeas corpus, jurisprudência, réu, petição inicial, sentença, agravo, recurso especial, mandado de segurança, advogado, magistrado, promotor, defensor, testemunha, perito, laudo, audiência, conciliação, mediação, arbitragem, execução",
    "tecnologia": "algoritmo, latência, throughput, cache, endpoint, microsserviço, container, orquestração, Kubernetes, compilador, interpretador, depurador, repositório, branch, commit, merge, deploy, pipeline, refatoração, assíncrono",
    "economia": "inflação, PIB, taxa Selic, balança comercial, déficit, superávit, liberalização, política fiscal, monetária, cambial, tributária, orçamento, receita, despesa, investimento, poupança, consumo, oferta, demanda, elasticidade",
    "marketing": "funil de vendas, personas, SEO, ROI, taxa de conversão, lead, remarketing, brand awareness, posicionamento, segmentação, buyer persona, inbound, outbound, KPI, métrica, alcance, engajamento, criativo, anúncio, campanha",
    "politica": "constituição, emenda, projeto de lei, veto, medida provisória, plenário, comissão, relatoria, legislativo, executivo, judiciário, federal, estadual, municipal, eleição, mandato, sufrágio, cidadania, representatividade, oposição",
    "idioma": "sintaxe, morfologia, fonética, semântica, pragmática, cognato, polissemia, denotação, conotação, metáfora, metonímia, hipérbole, eufemismo, antítese, pleonasmo, elipse, anáfora, aliteração, assonância, paranomásia",
    "relacionamento": "vínculo, afeto, empatia, resiliência, comunicação não-violenta, validação, limite, confiança, respeito, reciprocidade, intimidade, cumplicidade, parceria, diálogo, escuta, acolhimento, vulnerabilidade, autonomia, cuidado",
    "financeiro": "CDI, LCI, LCA, debênture, ação, FII, tesouro direto, IPCA, taxa de juros, dividendos, renda fixa, renda variável, CDB, fundo imobiliário, ETF, BDR, câmbio, spread, volatilidade, liquidez",
}

WIKIPEDIA_ENDPOINT = "https://pt.wikipedia.org/w/api.php"

THEME_PAGES: dict[str, str] = {
    "saude": "Saúde",
    "lei": "Direito",
    "tecnologia": "Tecnologia",
    "economia": "Economia",
    "marketing": "Marketing",
    "politica": "Política",
    "idioma": "Linguística",
    "relacionamento": "Relacionamento interpessoal",
    "financeiro": "Finanças",
}


def get_vocabulary(theme: str) -> str:
    if theme == "outros":
        logger.info("theme=%s vocabulary skipped because no specialized prompt is required", theme)
        return ""
    path = THEME_DIR / f"{theme}.txt"
    logger.info("theme=%s checking local vocabulary file path=%s", theme, path)
    if _is_cache_valid(path):
        try:
            cached_content = path.read_text(encoding="utf-8")
        except OSError:
            logger.warning("theme=%s local vocabulary file exists but is unreadable path=%s", theme, path)
        else:
            if _is_vocabulary_content_valid(cached_content):
                logger.info(
                    "theme=%s using local vocabulary file path=%s terms=%s",
                    theme,
                    path,
                    len(_split_vocabulary(cached_content)),
                )
                return cached_content
            logger.warning("theme=%s local vocabulary file is invalid path=%s", theme, path)
    if path.exists():
        logger.info("theme=%s deleting invalid or stale vocabulary file path=%s", theme, path)
        path.unlink(missing_ok=True)
    content = _build_vocabulary(theme)
    logger.info(
        "theme=%s vocabulary prepared source=%s terms=%s",
        theme,
        "generated_or_fallback" if content else "empty",
        len(_split_vocabulary(content)) if content else 0,
    )
    return content


def _is_cache_valid(path: Path) -> bool:
    if not path.exists():
        logger.info("local vocabulary cache miss path=%s", path)
        return False
    if time.time() - path.stat().st_mtime > _CACHE_TTL:
        logger.info("local vocabulary cache expired path=%s", path)
        path.unlink(missing_ok=True)
        return False
    logger.info("local vocabulary cache hit path=%s", path)
    return True


def _is_vocabulary_content_valid(content: str) -> bool:
    words = _split_vocabulary(content)
    return len(words) >= 10


def _build_vocabulary(theme: str) -> str:
    logger.info("theme=%s fetching vocabulary terms from wikipedia", theme)
    words = _fetch_from_wikipedia(theme)
    words = _clean_vocabulary(words)
    words = _deduplicate_similar(words)
    words = _filter_noise(words)

    THEME_DIR.mkdir(parents=True, exist_ok=True)

    if len(words) >= 10:
        content = ", ".join(sorted(words, key=str.lower))
        (THEME_DIR / f"{theme}.txt").write_text(content, encoding="utf-8")
        logger.info(
            "theme=%s saved validated vocabulary file path=%s terms=%s source=wikipedia",
            theme,
            THEME_DIR / f"{theme}.txt",
            len(words),
        )
        return content

    fallback = FALLBACKS.get(theme, "")
    if _is_vocabulary_content_valid(fallback):
        (THEME_DIR / f"{theme}.txt").write_text(fallback, encoding="utf-8")
        logger.warning(
            "theme=%s wikipedia terms insufficient; saved fallback vocabulary path=%s terms=%s",
            theme,
            THEME_DIR / f"{theme}.txt",
            len(_split_vocabulary(fallback)),
        )
    else:
        logger.warning("theme=%s no valid wikipedia vocabulary and no valid fallback available", theme)
    return fallback


def _fetch_from_wikipedia(theme: str) -> list[str]:
    page_title = THEME_PAGES.get(theme)
    if not page_title:
        return []

    params = {
        "action": "query",
        "prop": "links",
        "titles": page_title,
        "pllimit": "max",
        "format": "json",
    }

    try:
        query_string = urllib.parse.urlencode(params)
        url = f"{WIKIPEDIA_ENDPOINT}?{query_string}"
        logger.info("theme=%s requesting wikipedia url=%s", theme, url)
        with urllib.request.urlopen(url, timeout=15) as response:
            data = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        logger.warning("theme=%s wikipedia request failed error=%s", theme, exc)
        return []

    pages = data.get("query", {}).get("pages", {})
    if not pages:
        return []

    page_id = next(iter(pages))
    links = pages[page_id].get("links", [])
    logger.info("theme=%s wikipedia returned raw_links=%s", theme, len(links))

    return [link["title"] for link in links if "title" in link]


def _clean_vocabulary(raw: list[str]) -> list[str]:
    result = []
    for w in raw:
        w = w.strip().lower()
        if len(w) < 3 or len(w) > 50:
            continue
        w = re.sub(r"^[^a-záéíóúãõâêîôûç]+|[^a-záéíóúãõâêîôûç]+$", "", w)
        if w:
            result.append(w)
    return result


def _deduplicate_similar(words: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for w in words:
        stem = w.removesuffix("s").removesuffix("a") + "o"
        if w not in seen and stem not in seen:
            seen.add(w)
            seen.add(stem)
            unique.append(w)
    return unique


def _filter_noise(words: list[str]) -> list[str]:
    STOP = {
        "artigo", "página", "referência", "ligação", "externo",
        "também", "sobre", "entre", "parte", "forma", "através",
        "ver", "principal", "notas", "idades", "índice",
    }
    return [w for w in words if w not in STOP]


def _split_vocabulary(content: str) -> list[str]:
    words = [item.strip() for item in content.split(",")]
    return [word for word in words if word]


def inspect_theme_file(theme: str) -> dict[str, object]:
    if theme == "outros":
        return {
            "theme": theme,
            "exists": False,
            "valid": True,
            "source": "none",
            "terms": 0,
            "reason": "no_theme_prompt",
        }

    path = THEME_DIR / f"{theme}.txt"
    if not path.exists():
        return {
            "theme": theme,
            "exists": False,
            "valid": False,
            "source": "missing",
            "terms": 0,
            "reason": "missing",
        }

    try:
        content = path.read_text(encoding="utf-8")
    except OSError:
        return {
            "theme": theme,
            "exists": True,
            "valid": False,
            "source": "invalid_file",
            "terms": 0,
            "reason": "unreadable",
        }

    terms = _split_vocabulary(content)
    valid = _is_vocabulary_content_valid(content)
    return {
        "theme": theme,
        "exists": True,
        "valid": valid,
        "source": "cache" if valid else "invalid_file",
        "terms": len(terms),
        "reason": "ok" if valid else "invalid_content",
    }


def prepare_vocabulary(theme: str) -> dict[str, object]:
    logger.info("theme=%s prepare_vocabulary started", theme)
    before = inspect_theme_file(theme)
    if theme == "outros":
        logger.info("theme=%s preparation finished without prompt file", theme)
        return before

    if bool(before["valid"]):
        logger.info("theme=%s preparation finished using existing valid file", theme)
        return before

    prompt = get_vocabulary(theme)
    after = inspect_theme_file(theme)
    result = {
        "theme": theme,
        "exists": bool(after["exists"]),
        "valid": bool(after["valid"]) or _is_vocabulary_content_valid(prompt),
        "source": "cache" if bool(after["valid"]) else ("fallback" if prompt else "empty"),
        "terms": len(_split_vocabulary(prompt)) if prompt else 0,
        "reason": "prepared" if prompt else "unavailable",
    }
    logger.info("theme=%s preparation finished result=%s", theme, result)
    return result
