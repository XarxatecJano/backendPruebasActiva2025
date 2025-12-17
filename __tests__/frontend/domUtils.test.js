// Tests para DOMUtils
describe('DOMUtils', () => {
  let DOMUtils;

  beforeEach(() => {
    // Evaluar el código del archivo directamente
    const fs = require('fs');
    const path = require('path');
    const domUtilsCode = fs.readFileSync(path.join(__dirname, '../../public/js/domUtils.js'), 'utf8');
    
    // Crear un contexto aislado para evaluar el código
    const context = {
      document: {
        getElementById: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([]),
        createElement: jest.fn().mockImplementation((tagName) => createMockElement('mock', tagName))
      },
      console: global.console
    };
    
    // Evaluar el código en el contexto
    const vm = require('vm');
    vm.createContext(context);
    vm.runInContext(domUtilsCode, context);
    
    DOMUtils = context.DOMUtils;
  });

  describe('getElementById', () => {
    it('should return element when found', () => {
      const mockElement = createMockElement('test-id');
      const mockDocument = {
        getElementById: jest.fn().mockReturnValue(mockElement)
      };
      
      // Simular document global
      global.document = mockDocument;
      
      const result = DOMUtils.getElementById('test-id');

      expect(mockDocument.getElementById).toHaveBeenCalledWith('test-id');
      expect(result).toBe(mockElement);
    });

    it('should return null and warn when element not found', () => {
      const mockDocument = {
        getElementById: jest.fn().mockReturnValue(null)
      };
      
      global.document = mockDocument;
      const consoleSpy = jest.spyOn(console, 'warn');

      const result = DOMUtils.getElementById('non-existent');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("Element with id 'non-existent' not found");
    });
  });

  describe('toggleClass', () => {
    it('should toggle class when element exists', () => {
      const mockElement = createMockElement('test');
      
      DOMUtils.toggleClass(mockElement, 'active');

      expect(mockElement.classList.toggle).toHaveBeenCalledWith('active');
    });

    it('should toggle class with force parameter', () => {
      const mockElement = createMockElement('test');
      
      DOMUtils.toggleClass(mockElement, 'active', true);

      expect(mockElement.classList.toggle).toHaveBeenCalledWith('active', true);
    });

    it('should not throw when element is null', () => {
      expect(() => {
        DOMUtils.toggleClass(null, 'active');
      }).not.toThrow();
    });
  });

  describe('addClass', () => {
    it('should add class when element exists', () => {
      const mockElement = createMockElement('test');
      
      DOMUtils.addClass(mockElement, 'new-class');

      expect(mockElement.classList.add).toHaveBeenCalledWith('new-class');
    });

    it('should not throw when element is null', () => {
      expect(() => {
        DOMUtils.addClass(null, 'new-class');
      }).not.toThrow();
    });
  });

  describe('removeClass', () => {
    it('should remove class when element exists', () => {
      const mockElement = createMockElement('test');
      
      DOMUtils.removeClass(mockElement, 'old-class');

      expect(mockElement.classList.remove).toHaveBeenCalledWith('old-class');
    });

    it('should not throw when element is null', () => {
      expect(() => {
        DOMUtils.removeClass(null, 'old-class');
      }).not.toThrow();
    });
  });

  describe('clearContent', () => {
    it('should clear innerHTML when element exists', () => {
      const mockElement = createMockElement('test');
      mockElement.innerHTML = 'some content';
      
      DOMUtils.clearContent(mockElement);

      expect(mockElement.innerHTML).toBe('');
    });

    it('should not throw when element is null', () => {
      expect(() => {
        DOMUtils.clearContent(null);
      }).not.toThrow();
    });
  });
});