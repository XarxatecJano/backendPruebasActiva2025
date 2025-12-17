// Setup para tests de frontend

// Mock de fetch global
global.fetch = jest.fn();

// Mock de alert
global.alert = jest.fn();

// Mock de Date para tests consistentes
const mockDate = new Date('2025-12-17T12:00:00.000Z');
global.Date = class extends Date {
  constructor(...args) {
    if (args.length === 0) {
      return mockDate;
    }
    return new (Date.bind(null, ...args))();
  }
  
  static now() {
    return mockDate.getTime();
  }
};

// Mock de console para evitar spam en tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Mock de window.location - evitar redefinir
if (!window.location.mockClear) {
  // Solo si no está ya mockeado
  window.location.href = '';
  window.location.search = '';
}

// Mock de URLSearchParams
global.URLSearchParams = jest.fn().mockImplementation((search) => ({
  get: jest.fn().mockReturnValue(null)
}));

// Helper para crear elementos DOM mock
global.createMockElement = (id, tagName = 'div') => {
  const element = {
    id,
    tagName: tagName.toUpperCase(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn()
    },
    innerHTML: '',
    textContent: '',
    value: '',
    dataset: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn().mockReturnValue([]),
    appendChild: jest.fn(),
    remove: jest.fn(),
    closest: jest.fn(),
    getAttribute: jest.fn(),
    setAttribute: jest.fn(),
    reset: jest.fn()
  };
  return element;
};

// Limpiar mocks antes de cada test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset window.location si existe
  if (window.location) {
    window.location.search = '';
    window.location.href = '';
  }
  
  // Reset URLSearchParams
  URLSearchParams.mockImplementation((search) => ({
    get: jest.fn().mockReturnValue(null)
  }));
});