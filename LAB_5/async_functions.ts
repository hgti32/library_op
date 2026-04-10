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


//function - filterAsync
// Async/Await
async function checkPermissions(userIds: number[]) {
  try {
    const activeUsers = await filterAsync(userIds, async (id) => {
      const response = await fetch(`/api/users/${id}/status`);
      const data = await response.json();
      return data.isActive;
    });
    
    console.log("Active users:", activeUsers);
  } catch (error) {
    console.error("Failed to filter users:", error);
  }
}


//Demo Cases
const numbers = [1, 2, 3, 4, 5];

filterAsyncCallback(
  numbers,
  (num, done) => setTimeout(() => done(num % 2 === 0), 100),
  (result) => console.log("Callback Result:", result)
);


//Promise + Async/Await
const words = ["apple", "iron", "banana", "ice"];

async function demo() {
  const startsWithI = await filterAsync(words, async (word) => {
    return word.startsWith('i');
  });
  console.log("Words starting with 'i':", startsWithI);
}
demo();


//Abortable support
async function cancellableDemo() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 150);

  try {
    const result = await filterAsync(
      [10, 20, 30],
      async (num) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return num > 15;
      },
      { signal: controller.signal }
    );
    console.log("Result:", result);
  } catch (err: any) {
    if (err.name === 'AbortError' || err.message.includes('abort') || err.message.includes('cancel')) {
      console.log("Filtering was cancelled by the user or due to timeout");
    } else {
      throw err;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

cancellableDemo();