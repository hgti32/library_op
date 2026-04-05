type QueueNode<T> = {
  item: T;
  priority: number;
  index: number;
};

class BiDirectionalPriorityQueue<T> {
  private nodes: QueueNode<T>[] = [];
  private counter: number = 0;

  enqueue(item: T, priority: number): void {
    this.nodes.push({
      item,
      priority,
      index: this.counter++
    });
  }

  private getTargetIndex(mode: 'highest' | 'lowest' | 'oldest' | 'newest'): number {
    if (this.nodes.length === 0){
        return -1;
    }

    let targetIdx = 0;
    for (let i = 1; i < this.nodes.length; i++) {
      const current = this.nodes[i];
      const best = this.nodes[targetIdx];

      let isBetter = false;
      switch (mode) {
        case 'highest':
          isBetter = current.priority > best.priority || 
            (current.priority === best.priority && current.index < best.index);
          break;
        case 'lowest':
          isBetter = current.priority < best.priority ||
            (current.priority === best.priority && current.index < best.index);
          break;
        case 'oldest':
          isBetter = current.index < best.index;
          break;
        case 'newest':
          isBetter = current.index > best.index;
          break;
      }
      if (isBetter){ 
        targetIdx = i;
      }
    }
    
    return targetIdx;
  }

  peek(mode: 'highest' | 'lowest' | 'oldest' | 'newest'): T | undefined {
    const idx = this.getTargetIndex(mode);
    return idx === -1 ? undefined : this.nodes[idx].item;
  }

  dequeue(mode: 'highest' | 'lowest' | 'oldest' | 'newest'): T | undefined {
    const idx = this.getTargetIndex(mode);
    if (idx === -1) {
      return undefined;
    }
    return this.nodes.splice(idx, 1)[0].item;
  }

  isEmpty(): boolean {
    return this.nodes.length === 0;
  }

  size(): number {
    return this.nodes.length;
  }
}