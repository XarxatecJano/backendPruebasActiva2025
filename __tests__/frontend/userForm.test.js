// Tests para UserForm
describe('UserForm', () => {
  let UserForm, DOMUtils, UserService, MessageHandler, UserTable, HomeApp;

  beforeEach(() => {
    // Mock dependencies
    global.DOMUtils = {
      getElementById: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn()
    };

    global.UserService = {
      updateUser: jest.fn()
    };

    global.MessageHandler = {
      handleServiceResponse: jest.fn(),
      showSuccessMessage: jest.fn()
    };

    global.UserTable = {
      updateRow: jest.fn(),
      hide: jest.fn(),
      show: jest.fn()
    };

    global.HomeApp = {
      getCurrentUser: jest.fn(),
      updateCurrentUser: jest.fn()
    };

    delete require.cache[require.resolve('../../public/js/userForm.js')];
    UserForm = require('../../public/js/userForm.js');
    DOMUtils = global.DOMUtils;
    UserService = global.UserService;
    MessageHandler = global.MessageHandler;
    UserTable = global.UserTable;
    HomeApp = global.HomeApp;
  });

  describe('init', () => {
    it('should initialize DOM elements and setup event listeners', () => {
      const mockEditSection = createMockElement('edit-section');
      const mockEditForm = createMockElement('edit-form', 'form');
      const mockCancelBtn = createMockElement('cancel-edit');
      const mockUsernameInput = createMockElement('edit-username', 'input');
      const mockEmailInput = createMockElement('edit-email', 'input');

      DOMUtils.getElementById
        .mockReturnValueOnce(mockEditSection)
        .mockReturnValueOnce(mockEditForm)
        .mockReturnValueOnce(mockCancelBtn)
        .mockReturnValueOnce(mockUsernameInput)
        .mockReturnValueOnce(mockEmailInput)
        .mockReturnValueOnce(null) // phone
        .mockReturnValueOnce(null) // zip
        .mockReturnValueOnce(null); // role

      UserForm.init();

      expect(DOMUtils.getElementById).toHaveBeenCalledWith('edit-section');
      expect(DOMUtils.getElementById).toHaveBeenCalledWith('edit-form');
      expect(mockCancelBtn.addEventListener).toHaveBeenCalled();
      expect(mockEditForm.addEventListener).toHaveBeenCalled();
    });
  });

  describe('showEditForm', () => {
    it('should show form with user data', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone: '123456789',
        zip_code: '12345',
        role: 'admin'
      };

      const mockForm = createMockElement('edit-form', 'form');
      const mockUsernameInput = createMockElement('edit-username', 'input');
      const mockEmailInput = createMockElement('edit-email', 'input');
      const mockSubmitBtn = createMockElement('submit-edit');

      UserForm.elements.editForm = mockForm;
      UserForm.elements.usernameInput = mockUsernameInput;
      UserForm.elements.emailInput = mockEmailInput;

      HomeApp.getCurrentUser.mockReturnValue(mockUser);
      DOMUtils.getElementById.mockReturnValue(mockSubmitBtn);

      UserForm.showEditForm(1);

      expect(HomeApp.getCurrentUser).toHaveBeenCalledWith(1);
      expect(mockUsernameInput.value).toBe('testuser');
      expect(mockEmailInput.value).toBe('test@example.com');
      expect(mockForm.dataset.userId).toBe('1');
      expect(UserTable.hide).toHaveBeenCalled();
    });

    it('should handle missing user', () => {
      HomeApp.getCurrentUser.mockReturnValue(null);
      const consoleSpy = jest.spyOn(console, 'error');

      UserForm.showEditForm(999);

      expect(consoleSpy).toHaveBeenCalledWith('Usuario no encontrado:', 999);
      expect(UserTable.hide).not.toHaveBeenCalled();
    });
  });

  describe('hideEditForm', () => {
    it('should hide form and show table', () => {
      const mockForm = createMockElement('edit-form', 'form');
      UserForm.elements.editForm = mockForm;

      const hideSpy = jest.spyOn(UserForm, 'hide');
      const resetSpy = jest.spyOn(UserForm, 'resetForm');

      UserForm.hideEditForm();

      expect(hideSpy).toHaveBeenCalled();
      expect(UserTable.show).toHaveBeenCalled();
      expect(resetSpy).toHaveBeenCalled();
    });
  });

  describe('getFormData', () => {
    it('should return form data object', () => {
      const mockUsernameInput = { value: 'testuser' };
      const mockEmailInput = { value: 'test@example.com' };
      const mockPhoneInput = { value: '123456789' };
      const mockZipInput = { value: '12345' };
      const mockRoleInput = { value: 'admin' };

      UserForm.elements.usernameInput = mockUsernameInput;
      UserForm.elements.emailInput = mockEmailInput;
      UserForm.elements.phoneInput = mockPhoneInput;
      UserForm.elements.zipInput = mockZipInput;
      UserForm.elements.roleInput = mockRoleInput;

      const result = UserForm.getFormData();

      expect(result).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        phone: '123456789',
        zip_code: '12345',
        role: 'admin'
      });
    });

    it('should handle null inputs', () => {
      UserForm.elements.usernameInput = null;
      UserForm.elements.emailInput = null;
      UserForm.elements.phoneInput = null;
      UserForm.elements.zipInput = null;
      UserForm.elements.roleInput = null;

      const result = UserForm.getFormData();

      expect(result).toEqual({
        username: '',
        email: '',
        phone: '',
        zip_code: '',
        role: 'user'
      });
    });
  });

  describe('handleFormSubmit', () => {
    beforeEach(() => {
      global.alert = jest.fn();
    });

    it('should update user successfully', async () => {
      const mockForm = createMockElement('edit-form', 'form');
      mockForm.dataset.userId = '1';
      UserForm.elements.editForm = mockForm;

      const mockUsernameInput = { value: 'updateduser' };
      UserForm.elements.usernameInput = mockUsernameInput;
      UserForm.elements.emailInput = { value: 'updated@test.com' };
      UserForm.elements.phoneInput = { value: '987654321' };
      UserForm.elements.zipInput = { value: '54321' };
      UserForm.elements.roleInput = { value: 'user' };

      const mockResponse = { success: true, message: 'Usuario actualizado' };
      UserService.updateUser.mockResolvedValue(mockResponse);
      MessageHandler.handleServiceResponse.mockReturnValue(true);

      const hideFormSpy = jest.spyOn(UserForm, 'hideEditForm');

      const mockEvent = { preventDefault: jest.fn() };
      await UserForm.handleFormSubmit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(UserService.updateUser).toHaveBeenCalledWith(1, {
        username: 'updateduser',
        email: 'updated@test.com',
        phone: '987654321',
        zip_code: '54321',
        role: 'user'
      });
      expect(UserTable.updateRow).toHaveBeenCalled();
      expect(HomeApp.updateCurrentUser).toHaveBeenCalled();
      expect(MessageHandler.showSuccessMessage).toHaveBeenCalledWith('update');
      expect(hideFormSpy).toHaveBeenCalled();
    });

    it('should show alert for empty username', async () => {
      const mockForm = createMockElement('edit-form', 'form');
      mockForm.dataset.userId = '1';
      UserForm.elements.editForm = mockForm;

      const mockUsernameInput = { value: '   ' }; // Empty/whitespace
      UserForm.elements.usernameInput = mockUsernameInput;

      const mockEvent = { preventDefault: jest.fn() };
      await UserForm.handleFormSubmit(mockEvent);

      expect(alert).toHaveBeenCalledWith('El nombre de usuario es requerido');
      expect(UserService.updateUser).not.toHaveBeenCalled();
    });

    it('should handle missing user ID', async () => {
      const mockForm = createMockElement('edit-form', 'form');
      mockForm.dataset.userId = undefined;
      UserForm.elements.editForm = mockForm;

      const consoleSpy = jest.spyOn(console, 'error');

      const mockEvent = { preventDefault: jest.fn() };
      await UserForm.handleFormSubmit(mockEvent);

      expect(consoleSpy).toHaveBeenCalledWith('No se encontró ID de usuario para actualizar');
      expect(UserService.updateUser).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const mockForm = createMockElement('edit-form', 'form');
      mockForm.dataset.userId = '1';
      UserForm.elements.editForm = mockForm;

      UserForm.elements.usernameInput = { value: 'testuser' };
      UserForm.elements.emailInput = { value: 'test@example.com' };
      UserForm.elements.phoneInput = { value: '123456789' };
      UserForm.elements.zipInput = { value: '12345' };
      UserForm.elements.roleInput = { value: 'user' };

      const mockResponse = { success: false, error: 'forbidden' };
      UserService.updateUser.mockResolvedValue(mockResponse);
      MessageHandler.handleServiceResponse.mockReturnValue(false);

      const mockEvent = { preventDefault: jest.fn() };
      await UserForm.handleFormSubmit(mockEvent);

      expect(MessageHandler.handleServiceResponse).toHaveBeenCalledWith(mockResponse);
      expect(UserTable.updateRow).not.toHaveBeenCalled();
    });

    it('should show alert for update failure', async () => {
      const mockForm = createMockElement('edit-form', 'form');
      mockForm.dataset.userId = '1';
      UserForm.elements.editForm = mockForm;

      UserForm.elements.usernameInput = { value: 'testuser' };
      UserForm.elements.emailInput = { value: 'test@example.com' };
      UserForm.elements.phoneInput = { value: '123456789' };
      UserForm.elements.zipInput = { value: '12345' };
      UserForm.elements.roleInput = { value: 'user' };

      const mockResponse = { success: false, message: 'Error de validación' };
      UserService.updateUser.mockResolvedValue(mockResponse);
      MessageHandler.handleServiceResponse.mockReturnValue(true);

      const mockEvent = { preventDefault: jest.fn() };
      await UserForm.handleFormSubmit(mockEvent);

      expect(alert).toHaveBeenCalledWith('Error: Error de validación');
    });
  });
});