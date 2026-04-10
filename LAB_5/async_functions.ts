//function - filter
//Callback-based
function filterAsyncCallback<T>(
  array: T[],
  predicate: (item: T, callback: (result: boolean) => void) => void,
  onComplete: (result: T[]) => void
): void {
  const results: T[] = [];
  let processedCount = 0;

  if (array.length === 0) {
    onComplete([]);
    return;
  }

  array.forEach((item, index) => {
    predicate(item, (isPassed) => {
      if (isPassed) {
        results[index] = item;
      }
      processedCount++;

      if (processedCount === array.length) {
        onComplete(results.filter(() => true)); 
      }
    });
  });
}

//Promise-based
async function filterAsync<T>(
  array: T[],
  predicate: (item: T, signal?: AbortSignal) => Promise<boolean>,
  options?: { signal?: AbortSignal }
): Promise<T[]> {
  const signal = options?.signal;

  const truthIndices = await Promise.all(
    array.map(async (item) => {
      if (signal?.aborted) throw new Error("Operation aborted");
      return await predicate(item, signal);
    })
  );

  return array.filter((_, index) => truthIndices[index]);
}