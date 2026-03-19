export function consumeWithTimeout(iterator: Iterator<number>, seconds: number): void {
    const timeoutMs = seconds * 1000;
    const startTime = Date.now();
    let count = 0;

    console.log(`Бібліотека: Починаємо споживання на ${seconds}с...`);

    while (Date.now() - startTime < timeoutMs) {
        const result = iterator.next();
        if (result.done) break;

        if (count % 1000000 === 0) {
            console.log(`Оброблено: ${result.value}`);
        }
        count++;
    }
    console.log(`Всього оброблено: ${count.toLocaleString()}`);
}