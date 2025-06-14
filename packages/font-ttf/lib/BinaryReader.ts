export class BinaryReader {
  private readonly data: Uint8Array;
  private position = 0;

  constructor(data: ArrayBuffer) {
    this.data = new Uint8Array(data);
  }

  getUint16(): Uint16 {
    const value = ((this.data[this.position] << 8) | this.data[this.position + 1]) >>> 0;
    this.position += 2;
    return value;
  }

  getInt16(): Int16 {
    const value = this.getUint16();
    return value & 0x8000 ? value - 0x10000 : value;
  }

  getUint32(): Uint32 {
    const value = this.getInt32() >>> 0;
    return value;
  }

  getInt32(): Int32 {
    const value =
      (this.data[this.position] << 24) |
      (this.data[this.position + 1] << 16) |
      (this.data[this.position + 2] << 8) |
      this.data[this.position + 3];
    this.position += 4;
    return value;
  }

  getFixed(): Fixed {
    const integer = this.getUint16();
    const fraction = this.getUint16();
    return integer + fraction / 0x10000;
  }

  getDate(): Date {
    const macTime = this.getUint32() * 0x100000000 + this.getUint32();
    const utcTime = macTime * 1000 + Date.UTC(1904, 1, 1);
    return new Date(utcTime);
  }

  getFWord(): FWord {
    return this.getInt16();
  }

  getString(length: number): string {
    const data = this.getDataSlice(this.position, length);
    const string = new TextDecoder().decode(data);
    this.position += length;

    return string;
  }

  getDataSlice(offset: number, length: number): Uint8Array {
    const data = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      data[i] = this.data[offset + i];
    }
    return data;
  }

  getPosition(): number {
    return this.position;
  }

  setPosition(position: number): void {
    this.position = position;
  }

  runAt<T>(position: number, action: () => T): T {
    const current = this.position;
    this.setPosition(position);
    const result = action();
    this.setPosition(current);
    return result;
  }
}
