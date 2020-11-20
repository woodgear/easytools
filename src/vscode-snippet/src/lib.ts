function replaceAll(string: string, search: string, replacement: string) {
    replacement = replacement.length === 0 ? '' : replacement;
    return string.split(search).join(replacement);
}

export function transform(snippet: string): string {
    return snippet
        .split('\n')
        .map((l) => {
            return `"${replaceAll(l, '"', '\\"')}"`;
        })
        .join(',\n');
}
