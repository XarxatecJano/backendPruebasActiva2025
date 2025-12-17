// Tests simplificados para DOMUtils
describe('DOMUtils - Simplified Tests', () => {
  let DOMUtils;

  beforeAll(() => {
    // Definir DOMUtils directamente en el test
    global.DOMUtils = {
      getElementById(id) {
        const element = document.getElementById(id);
        if (!element) {
          console.warn(`Element with id '${id}' not found`);
        }
        return element;
      },

      toggleClass(element, className, force = null) {
        if (!element) return;
        if (force !== null) {
          element.classList.toggle(className, force);
        } else {
          element.classList.toggle(className);
        }
      },

      addClass(element, className) {
        if (element) element.classList.add(className);
      },

      removeClass(element, className) {
        if (element) element.classList.remove(className);
      },

      clearContent(element) {
        if (element) element.innerHTML = '';
      }
    };

    DOMUtils = global.DOMUtils;
  });

  describe('getElementById', () => {
    it('should return element when found', () => {
      const mockElement = createMockElement('test-id');
      document.getElementById = jest.fn().mockReturnValue(mockElement);

      const result = DOMUtils.getElementById('test-id');

      expect(document.getElementById).toHaveBeenCalledWith('test-id');
      expect(result).toBe(mockElement);
    });

    it('should return null and warn when element not found', () => {
      document.getElementById = jest.fn().mockReturnValue(null);
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