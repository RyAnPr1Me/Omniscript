export class Crypto {
  static async hash(data: string, algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256'): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async encrypt(data: string, key: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const keyBuffer = await crypto.subtle.importKey(
      'raw',
      encoder.encode(key),
      'AES-GCM',
      false,
      ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyBuffer,
      dataBuffer
    );
    return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
  }
}
