// Tests para UserTable
describe('UserTable', () => {
  let UserTable, DOMUtils, UserModal, UserForm;

  beforeEach(() => {
    // Mock dependencies
    global.DOMUtils = {
      getElementById: jest.fn(),
      addClass: jest.fn(),
      removeClass: jest.fn(),
      clearContent: jest.fn()
    };

    global.UserModal = {
      showDeleteModal: jest.fn()
    };

    global.UserForm = {
      showEditForm: jest.fn()
    };

    delete require.cache[require.resolve('../../public/js/userTable.js')];
    UserTable = require('../../public/js/userTable.js');
    DOMUtils = global.DOMUtils;
    UserModal = global.UserModal;
    UserForm = global.UserForm;
  });

  describe('init', () => {
    it('should initialize DOM elements', () => {
      const mockTbody = createMockElement('tbody', 'tbody');
      const mockUsersSection = createMockElement('users-section');

      document.querySelector.mockReturnValue(mockTbody);
      DOMUtils.getElementById.mockReturnValue(mockUsersSection);

      UserTable.init();

      expect(document.querySelector).toHaveBeenCalledWith('#users-table tbody');
      expect(DOMUtils.getElementById).toHaveBeenCalledWith('users-section');
      expect(UserTable.elements.tbody).toBe(mockTbody);
      expect(UserTable.elements.usersSection).toBe(mockUsersSection);
    });
  });

  describe('createUserRowHTML', () => {
    it('should create correct HTML for user row', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone: '123456789',
        zip_code: '12345',
        role: 'admin'
      };

      const html = UserTable.createUserRowHTML(user);

      expect(html).toContain('<td>testuser</td>');
      expect(html).toContain('<td>test@example.com</td>');
      expect(html).toContain('<td>123456789</td>');
      expect(html).toContain('<td>12345</td>');
      expect(html).toContain('<td>admin</td>');
      expect(html).toContain('data-user-id="1"');
      expect(html).toContain('btn-edit');
      expect(html).toContain('btn-delete');
    });

    it('should handle missing user data with dashes', () => {
      const user = {
        id: 2,
        username: 'testuser2'
        // Missing email, phone, zip_code, role
      };

      const html = UserTable.createUserRowHTML(user);

      expect(html).toContain('<td>testuser2</td>');
      expect(html).toContain('<td>-</td>'); // For missing email
      expect(html).toContain('data-user-id="2"');
    });
  });

  describe('render', () => {
    it('should render users table correctly', () => {
      const mockTbody = createMockElement('tbody', 'tbody');
      UserTable.elements.tbody = mockTbody;

      const users = [
        { id: 1, username: 'user1', email: 'user1@test.com' },
        { id: 2, username: 'user2', email: 'user2@test.com' }
      ];

      const mockRow1 = createMockElement('tr', 'tr');
      const mockRow2 = createMockElement('tr', 'tr');
      document.createElement
        .mockReturnValueOnce(mockRow1)
        .mockReturnValueOnce(mockRow2);

      // Mock querySelectorAll for event listeners
      document.querySelectorAll.mockReturnValue([]);

      UserTable.render(users);

      expect(DOMUtils.clearContent).toHaveBeenCalledWith(mockTbody);
      expect(document.createElement).toHaveBeenCalledTimes(2);
      expect(mockTbody.appendChild).toHaveBeenCalledWith(mockRow1);
      expect(mockTbody.appendChild).toHaveBeenCalledWith(mockRow2);
    });

    it('should not render when tbody is null', () => {
      UserTable.elements.tbody = null;
      const users = [{ id: 1, username: 'user1' }];

      expect(() => {
        UserTable.render(users);
      }).not.toThrow();

      expect(DOMUtils.clearContent).not.toHaveBeenCalled();
    });
  });

  describe('updateRow', () => {
    it('should update specific user row', () => {
      const mockButton = createMockElement('button');
      const mockRow = createMockElement('tr', 'tr');
      
      mockButton.closest.mockReturnValue(mockRow);
      document.querySelector.mockReturnValue(mockButton);

      const userData = {
        username: 'updated_user',
        email: 'updated@test.com'
      };

      UserTable.updateRow(1, userData);

      expect(document.querySelector).toHaveBeenCalledWith('[data-user-id="1"]');
      expect(mockButton.closest).toHaveBeenCalledWith('tr');
      expect(mockRow.innerHTML).toContain('updated_user');
    });

    it('should not throw when button not found', () => {
      document.querySelector.mockReturnValue(null);

      expect(() => {
        UserTable.updateRow(999, { username: 'test' });
      }).not.toThrow();
    });
  });

  describe('removeRow', () => {
    it('should remove specific user row', () => {
      const mockButton = createMockElement('button');
      const mockRow = createMockElement('tr', 'tr');
      
      mockButton.closest.mockReturnValue(mockRow);
      document.querySelector.mockReturnValue(mockButton);

      UserTable.removeRow(1);

      expect(document.querySelector).toHaveBeenCalledWith('[data-user-id="1"]');
      expect(mockRow.remove).toHaveBeenCalled();
    });
  });

  describe('show and hide', () => {
    it('should show users section', () => {
      const mockSection = createMockElement('users-section');
      UserTable.elements.usersSection = mockSection;

      UserTable.show();

      expect(DOMUtils.removeClass).toHaveBeenCalledWith(mockSection, 'hidden');
    });

    it('should hide users section', () => {
      const mockSection = createMockElement('users-section');
      UserTable.elements.usersSection = mockSection;

      UserTable.hide();

      expect(DOMUtils.addClass).toHaveBeenCalledWith(mockSection, 'hidden');
    });
  });

  describe('attachEventListeners', () => {
    it('should attach event listeners to delete and edit buttons', () => {
      const mockDeleteBtn = createMockElement('button');
      const mockEditBtn = createMockElement('button');
      
      mockDeleteBtn.getAttribute.mockReturnValue('1');
      mockEditBtn.getAttribute.mockReturnValue('1');

      document.querySelectorAll
        .mockReturnValueOnce([mockDeleteBtn])  // .btn-delete
        .mockReturnValueOnce([mockEditBtn]);   // .btn-edit

      UserTable.attachEventListeners();

      expect(mockDeleteBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
      expect(mockEditBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

      // Test the event handlers
      const deleteHandler = mockDeleteBtn.addEventListener.mock.calls[0][1];
      const editHandler = mockEditBtn.addEventListener.mock.calls[0][1];

      const mockEvent = {
        currentTarget: {
          getAttribute: jest.fn().mockReturnValue('1')
        }
      };

      deleteHandler(mockEvent);
      expect(UserModal.showDeleteModal).toHaveBeenCalledWith(1);

      editHandler(mockEvent);
      expect(UserForm.showEditForm).toHaveBeenCalledWith(1);
    });
  });
});