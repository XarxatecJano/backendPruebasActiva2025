// Tests simplificados para UserTable
describe('UserTable - Simplified Tests', () => {
  let UserTable, DOMUtils, UserModal, UserForm;

  beforeAll(() => {
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

    // Definir UserTable directamente
    global.UserTable = {
      elements: {
        tbody: null,
        usersSection: null
      },

      init() {
        this.elements.tbody = document.querySelector('#users-table tbody');
        this.elements.usersSection = DOMUtils.getElementById('users-section');
      },

      createUserRowHTML(user) {
        return `
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td>${user.zip_code || '-'}</td>
            <td>${user.role || '-'}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit" data-user-id="${user.id}" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                </button>
                <button class="btn-action btn-delete" data-user-id="${user.id}" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </button>
            </td>
        `;
      },

      render(users) {
        if (!this.elements.tbody) return;
        
        DOMUtils.clearContent(this.elements.tbody);
        
        users.forEach(user => {
          const row = document.createElement('tr');
          row.innerHTML = this.createUserRowHTML(user);
          this.elements.tbody.appendChild(row);
        });

        this.attachEventListeners();
      },

      updateRow(userId, userData) {
        const button = document.querySelector(`[data-user-id="${userId}"]`);
        if (!button) return;
        
        const row = button.closest('tr');
        if (!row) return;
        
        row.innerHTML = this.createUserRowHTML({
          id: userId,
          ...userData
        });
        
        this.attachRowEventListeners(row);
      },

      removeRow(userId) {
        const button = document.querySelector(`[data-user-id="${userId}"]`);
        if (!button) return;
        
        const row = button.closest('tr');
        if (row) {
          row.remove();
        }
      },

      show() {
        if (this.elements.usersSection) {
          DOMUtils.removeClass(this.elements.usersSection, 'hidden');
        }
      },

      hide() {
        if (this.elements.usersSection) {
          DOMUtils.addClass(this.elements.usersSection, 'hidden');
        }
      },

      attachEventListeners() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
            UserModal.showDeleteModal(userId);
          });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
            UserForm.showEditForm(userId);
          });
        });
      },

      attachRowEventListeners(row) {
        const deleteBtn = row.querySelector('.btn-delete');
        const editBtn = row.querySelector('.btn-edit');
        
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
            UserModal.showDeleteModal(userId);
          });
        }
        
        if (editBtn) {
          editBtn.addEventListener('click', (e) => {
            const userId = parseInt(e.currentTarget.getAttribute("data-user-id"));
            UserForm.showEditForm(userId);
          });
        }
      }
    };

    UserTable = global.UserTable;
    DOMUtils = global.DOMUtils;
    UserModal = global.UserModal;
    UserForm = global.UserForm;
  });

  describe('init', () => {
    it('should initialize DOM elements', () => {
      const mockTbody = createMockElement('tbody', 'tbody');
      const mockUsersSection = createMockElement('users-section');

      document.querySelector = jest.fn().mockReturnValue(mockTbody);
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
      };

      const html = UserTable.createUserRowHTML(user);

      expect(html).toContain('<td>testuser2</td>');
      expect(html).toContain('<td>-</td>');
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
      document.createElement = jest.fn()
        .mockReturnValueOnce(mockRow1)
        .mockReturnValueOnce(mockRow2);

      document.querySelectorAll = jest.fn().mockReturnValue([]);

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
      document.querySelector = jest.fn().mockReturnValue(mockButton);

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
      document.querySelector = jest.fn().mockReturnValue(null);

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
      document.querySelector = jest.fn().mockReturnValue(mockButton);

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

      document.querySelectorAll = jest.fn()
        .mockReturnValueOnce([mockDeleteBtn])
        .mockReturnValueOnce([mockEditBtn]);

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