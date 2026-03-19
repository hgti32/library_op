export function* incrementalCounter(start: number = 0): Generator<number> {
    let current = start;
    while (true) {
        yield current++;
    }
}