// Test básico para verificar que el entorno funciona
describe('Frontend Test Environment', () => {
  it('should have jsdom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('should have fetch mock', () => {
    expect(typeof fetch).toBe('function');
  });

  it('should be able to create DOM elements', () => {
    const div = document.createElement('div');
    expect(div.tagName).toBe('DIV');
  });
});