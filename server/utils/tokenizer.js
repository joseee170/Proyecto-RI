const STOPWORDS = new Set([
    "de", "la", "y", "el", "en", "los", "las", "un", "una",
    "http", "www", "com", "org", "mx", "vol", "gac",
    "para", "con", "por", "del", "al", "es", "son",
    "ser", "se", "su", "sus", "que", "no", "si", "mas",
    "pero", "como", "este", "esta", "ese", "esa", "esto"
]);

function tokenize(text = "") {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

module.exports = { tokenize, STOPWORDS };
