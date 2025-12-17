// Tests para UserModal
describe('UserModal', () => {
  let UserModal, DOMUtils, UserService, MessageHandler, UserTable;

  beforeEach(() => {
    // Mock dependencies
    global.DOMUtils = {
      getElementById: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn()
    };

    global.UserService = {
      deleteUser: jest.fn()
    };

    global.MessageHandler = {
      handleServiceResponse: jest.fn(),
      showSuccessMessage: jest.fn()
    };

    global.UserTable = {
      removeRow: jest.fn()
    };

    delete require.cache[require.resolve('../../public/js/userModal.js')];
    UserModal = require('../../public/js/userModal.js');
    DOMUtils = global.DOMUtils;
    UserService = global.UserService;
    MessageHandler = global.MessageHandler;
    UserTable = global.UserTable;
  });

  describe('init', () => {
    it('should initialize DOM elements and setup event listeners', () => {
      const mockModal = createMockElement('delete-modal');
      const mockCancelBtn = createMockElement('cancel-delete');
      const mockConfirmBtn = createMockElement('confirm-delete');
      const mockOverlay = createMockElement('modal-overlay');

      mockModal.querySelector.mockReturnValue(mockOverlay);

      DOMUtils.getElementById
        .mockReturnValueOnce(mockModal)
        .mockReturnValueOnce(mockCancelBtn)
        .mockReturnValueOnce(mockConfirmBtn);

      UserModal.init();

      expect(DOMUtils.getElementById).toHaveBeenCalledWith('delete-modal');
      expect(DOMUtils.getElementById).toHaveBeenCalledWith('cancel-delete');
      expect(DOMUtils.getElementById).toHaveBeenCalledWith('confirm-delete');
      expect(mockCancelBtn.addEventListener).toHaveBeenCalled();
      expect(mockOverlay.addEventListener).toHaveBeenCalled();
      expect(mockConfirmBtn.addEventListener).toHaveBeenCalled();
    });
  });

  describe('showDeleteModal', () => {
    it('should show modal and set userToDelete', () => {
      const mockModal = createMockElement('delete-modal');
      UserModal.elements.deleteModal = mockModal;

      UserModal.showDeleteModal(123);

      expect(UserModal.userToDelete).toBe(123);
      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockModal, 'hidden');
    });
  });

  describe('hideDeleteModal', () => {
    it('should hide modal and reset userToDelete', () => {
      const mockModal = createMockElement('delete-modal');
      UserModal.elements.deleteModal = mockModal;
      UserModal.userToDelete = 123;

      UserModal.hideDeleteModal();

      expect(UserModal.userToDelete).toBeNull();
      expect(DOMUtils.addClass).toHaveBeenCalledWith(mockModal, 'hidden');
    });
  });

  describe('handleDeleteConfirm', () => {
    it('should delete user successfully', async () => {
      UserModal.userToDelete = 123;
      
      const mockResponse = { success: true, message: 'Usuario eliminado' };
      UserService.deleteUser.mockResolvedValue(mockResponse);
      MessageHandler.handleServiceResponse.mockReturnValue(true);

      await UserModal.handleDeleteConfirm();

      expect(UserService.deleteUser).toHaveBeenCalledWith(123);
      expect(MessageHandler.handleServiceResponse).toHaveBeenCalledWith(mockResponse);
      expect(UserTable.removeRow).toHaveBeenCalledWith(123);
      expect(MessageHandler.showSuccessMessage).toHaveBeenCalledWith('delete');
      expect(UserModal.userToDelete).toBeNull();
    });

    it('should show alert when deletion fails', async () => {
      UserModal.userToDelete = 123;
      
      const mockResponse = { success: false, message: 'Error al eliminar' };
      UserService.deleteUser.mockResolvedValue(mockResponse);
      MessageHandler.handleServiceResponse.mockReturnValue(true);

      // Mock alert
      global.alert = jest.fn();

      await UserModal.handleDeleteConfirm();

      expect(alert).toHaveBeenCalledWith('Error: Error al eliminar');
    });

    it('should handle service response errors', async () => {
      UserModal.userToDelete = 123;
      
      const mockResponse = { success: false, error: 'forbidden' };
      UserService.deleteUser.mockResolvedValue(mockResponse);
      MessageHandler.handleServiceResponse.mockReturnValue(false);

      await UserModal.handleDeleteConfirm();

      expect(MessageHandler.handleServiceResponse).toHaveBeenCalledWith(mockResponse);
      expect(UserTable.removeRow).not.toHaveBeenCalled();
    });

    it('should hide modal for forbidden error', async () => {
      UserModal.userToDelete = 123;
      
      const mockResponse = { success: false, error: 'forbidden' };
      UserService.deleteUser.mockResolvedValue(mockResponse);
      MessageHandler.handleServiceResponse.mockReturnValue(false);

      const hideModalSpy = jest.spyOn(UserModal, 'hideDeleteModal');

      await UserModal.handleDeleteConfirm();

      expect(hideModalSpy).toHaveBeenCalled();
    });

    it('should not proceed when userToDelete is null', async () => {
      UserModal.userToDelete = null;

      await UserModal.handleDeleteConfirm();

      expect(UserService.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('setupEventListeners', () => {
    it('should setup cancel button event listener', () => {
      const mockCancelBtn = createMockElement('cancel-delete');
      UserModal.elements.cancelDelete = mockCancelBtn;

      UserModal.setupEventListeners();

      expect(mockCancelBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

      // Test the event handler
      const handler = mockCancelBtn.addEventListener.mock.calls[0][1];
      const hideModalSpy = jest.spyOn(UserModal, 'hideDeleteModal');

      handler();
      expect(hideModalSpy).toHaveBeenCalled();
    });

    it('should setup overlay click event listener', () => {
      const mockOverlay = createMockElement('modal-overlay');
      UserModal.elements.modalOverlay = mockOverlay;

      UserModal.setupEventListeners();

      expect(mockOverlay.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should setup confirm button event listener', () => {
      const mockConfirmBtn = createMockElement('confirm-delete');
      UserModal.elements.confirmDelete = mockConfirmBtn;

      UserModal.setupEventListeners();

      expect(mockConfirmBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

      // Test the event handler
      const handler = mockConfirmBtn.addEventListener.mock.calls[0][1];
      const handleDeleteSpy = jest.spyOn(UserModal, 'handleDeleteConfirm');

      handler();
      expect(handleDeleteSpy).toHaveBeenCalled();
    });
  });
});