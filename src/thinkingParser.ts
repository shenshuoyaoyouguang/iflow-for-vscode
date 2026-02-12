import { StreamChunk } from './protocol';

export class ThinkingParser {
  private buffer: string = '';
  private inThinking: boolean = false;

  parse(text: string): StreamChunk[] {
    this.buffer += text;
    const chunks: StreamChunk[] = [];

    while (true) {
      if (!this.inThinking) {
        const thinkStart = this.buffer.indexOf('<think>');
        if (thinkStart !== -1) {
          if (thinkStart > 0) {
            chunks.push({ chunkType: 'text', content: this.buffer.slice(0, thinkStart) });
          }
          chunks.push({ chunkType: 'thinking_start' });
          this.inThinking = true;
          this.buffer = this.buffer.slice(thinkStart + 7);
        } else {
          // Check for partial <think>
          const lastLt = this.buffer.lastIndexOf('<');
          if (lastLt !== -1 && '<think>'.startsWith(this.buffer.slice(lastLt))) {
            if (lastLt > 0) {
              chunks.push({ chunkType: 'text', content: this.buffer.slice(0, lastLt) });
              this.buffer = this.buffer.slice(lastLt);
            }
            break;
          } else {
            if (this.buffer.length > 0) {
              chunks.push({ chunkType: 'text', content: this.buffer });
              this.buffer = '';
            }
            break;
          }
        }
      } else {
        const thinkEnd = this.buffer.indexOf('</think>');
        if (thinkEnd !== -1) {
          if (thinkEnd > 0) {
            chunks.push({ chunkType: 'thinking_content', content: this.buffer.slice(0, thinkEnd) });
          }
          chunks.push({ chunkType: 'thinking_end' });
          this.inThinking = false;
          this.buffer = this.buffer.slice(thinkEnd + 8);
        } else {
          // Check for partial </think>
          const lastLt = this.buffer.lastIndexOf('<');
          if (lastLt !== -1 && '</think>'.startsWith(this.buffer.slice(lastLt))) {
            if (lastLt > 0) {
              chunks.push({ chunkType: 'thinking_content', content: this.buffer.slice(0, lastLt) });
              this.buffer = this.buffer.slice(lastLt);
            }
            break;
          } else {
            if (this.buffer.length > 0) {
              chunks.push({ chunkType: 'thinking_content', content: this.buffer });
              this.buffer = '';
            }
            break;
          }
        }
      }
    }
    return chunks;
  }
}
