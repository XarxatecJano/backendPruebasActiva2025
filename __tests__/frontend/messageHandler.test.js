// Tests para MessageHandler
describe('MessageHandler', () => {
  let MessageHandler, DOMUtils;

  beforeEach(() => {
    // Mock DOMUtils
    global.DOMUtils = {
      getElementById: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn()
    };

    delete require.cache[require.resolve('../../public/js/messageHandler.js')];
    MessageHandler = require('../../public/js/messageHandler.js');
    DOMUtils = global.DOMUtils;
  });

  describe('init', () => {
    it('should initialize all elements and setup listeners', () => {
      const mockErrorElement = createMockElement('error-message');
      const mockDeleteSuccessElement = createMockElement('delete-success-message');
      const mockUpdateSuccessElement = createMockElement('update-success-message');
      const mockCloseDeleteBtn = createMockElement('close-delete-success');
      const mockCloseUpdateBtn = createMockElement('close-update-success');

      DOMUtils.getElementById
        .mockReturnValueOnce(mockErrorElement)
        .mockReturnValueOnce(mockDeleteSuccessElement)
        .mockReturnValueOnce(mockUpdateSuccessElement)
        .mockReturnValueOnce(mockCloseDeleteBtn)
        .mockReturnValueOnce(mockCloseUpdateBtn);

      // Mock URLSearchParams
      global.URLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn().mockReturnValue(null)
      }));

      MessageHandler.init();

      expect(DOMUtils.getElementById).toHaveBeenCalledWith('error-message');
      expect(DOMUtils.getElementById).toHaveBeenCalledWith('delete-success-message');
      expect(DOMUtils.getElementById).toHaveBeenCalledWith('update-success-message');
      expect(mockCloseDeleteBtn.addEventListener).toHaveBeenCalled();
      expect(mockCloseUpdateBtn.addEventListener).toHaveBeenCalled();
    });

    it('should show error message when URL has error=permisos', () => {
      global.URLSearchParams = jest.fn().mockImplementation(() => ({
        get: jest.fn().mockReturnValue('permisos')
      }));

      const mockErrorElement = createMockElement('error-message');
      DOMUtils.getElementById.mockReturnValue(mockErrorElement);

      MessageHandler.init();

      expect(mockErrorElement.textContent).toBe('No tienes permisos para realizar esta acción');
      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockErrorElement, 'hidden');
    });
  });

  describe('showErrorMessage', () => {
    it('should show error message with custom text', () => {
      const mockElement = createMockElement('error-message');
      MessageHandler.elements.errorMessage = mockElement;

      MessageHandler.showErrorMessage('Custom error message');

      expect(mockElement.textContent).toBe('Custom error message');
      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockElement, 'hidden');
    });

    it('should show default error message when no text provided', () => {
      const mockElement = createMockElement('error-message');
      MessageHandler.elements.errorMessage = mockElement;

      MessageHandler.showErrorMessage();

      expect(mockElement.textContent).toBe('Ha ocurrido un error');
      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockElement, 'hidden');
    });

    it('should not throw when element is null', () => {
      MessageHandler.elements.errorMessage = null;

      expect(() => {
        MessageHandler.showErrorMessage('Test error');
      }).not.toThrow();
    });
  });

  describe('hideErrorMessage', () => {
    it('should hide error message', () => {
      const mockElement = createMockElement('error-message');
      MessageHandler.elements.errorMessage = mockElement;

      MessageHandler.hideErrorMessage();

      expect(DOMUtils.addClass).toHaveBeenCalledWith(mockElement, 'hidden');
    });
  });

  describe('showSuccessMessage', () => {
    it('should show delete success message', () => {
      const mockElement = createMockElement('delete-success-message');
      MessageHandler.elements.deleteSuccessMessage = mockElement;

      MessageHandler.showSuccessMessage('delete');

      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockElement, 'hidden');
    });

    it('should show update success message', () => {
      const mockElement = createMockElement('update-success-message');
      MessageHandler.elements.updateSuccessMessage = mockElement;

      MessageHandler.showSuccessMessage('update');

      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockElement, 'hidden');
    });
  });

  describe('handleServiceResponse', () => {
    beforeEach(() => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
    });

    it('should return true for successful response', () => {
      const response = { success: true };

      const result = MessageHandler.handleServiceResponse(response);

      expect(result).toBe(true);
    });

    it('should redirect for unauthorized error', () => {
      const response = {
        success: false,
        error: 'unauthorized',
        redirectUrl: '/login.html?error=sesion'
      };

      const result = MessageHandler.handleServiceResponse(response);

      expect(window.location.href).toBe('/login.html?error=sesion');
      expect(result).toBe(false);
    });

    it('should show error message for forbidden error', () => {
      const mockElement = createMockElement('error-message');
      MessageHandler.elements.errorMessage = mockElement;

      const response = {
        success: false,
        error: 'forbidden'
      };

      const result = MessageHandler.handleServiceResponse(response);

      expect(mockElement.textContent).toBe('No tienes permisos para realizar esta acción');
      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockElement, 'hidden');
      expect(result).toBe(false);
    });

    it('should show custom error message for other errors', () => {
      const mockElement = createMockElement('error-message');
      MessageHandler.elements.errorMessage = mockElement;

      const response = {
        success: false,
        error: 'custom_error',
        message: 'Custom error occurred'
      };

      const result = MessageHandler.handleServiceResponse(response);

      expect(mockElement.textContent).toBe('Custom error occurred');
      expect(result).toBe(false);
    });
  });
});