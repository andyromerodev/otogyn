import { describe, expect, it, vi } from 'vitest'
import { createAssistantsScreen } from './create-assistants-screen'

describe('createAssistantsScreen', () => {
  it('loads assistants and screen context through the use cases', async () => {
    const screen = createAssistantsScreen({
      listAssistantsUseCase: {
        execute: vi.fn().mockResolvedValue([
          {
            id: 'assistant_1',
            userId: 'assistant_1',
            organizationId: 'org_1',
            name: 'Laura Perez',
            email: 'laura@example.com',
            role: 'assistant',
            phone: '999888777',
            specialty: 'Atencion administrativa',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
      },
      checkAssistantEmailUseCase: {
        execute: vi.fn().mockResolvedValue({
          status: 'available',
          email: 'laura@example.com',
        }),
      },
      createAssistantUseCase: {
        execute: vi.fn(),
      },
      updateAssistantUseCase: {
        execute: vi.fn(),
      },
      deactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      reactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      deleteAssistantUseCase: {
        execute: vi.fn(),
      },
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    await screen.loadScreenContext()
    await screen.loadAssistants()

    expect(screen.canManageAssistants.value).toBe(true)
    expect(screen.assistants.value).toHaveLength(1)
  })

  it('submits an assistant and reloads the list', async () => {
    const listAssistantsUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'assistant_1',
            userId: 'assistant_1',
            organizationId: 'org_1',
            name: 'Laura Perez',
            email: 'laura@example.com',
            role: 'assistant',
            phone: '999888777',
            specialty: 'Atencion administrativa',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
    }

    const createAssistantUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'assistant_1',
        userId: 'assistant_1',
        organizationId: 'org_1',
        name: 'Laura Perez',
        email: 'laura@example.com',
        role: 'assistant',
        phone: '999888777',
        specialty: 'Atencion administrativa',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }

    const screen = createAssistantsScreen({
      listAssistantsUseCase,
      checkAssistantEmailUseCase: {
        execute: vi.fn().mockResolvedValue({
          status: 'available',
          email: 'laura@example.com',
        }),
      },
      createAssistantUseCase,
      updateAssistantUseCase: {
        execute: vi.fn(),
      },
      deactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      reactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      deleteAssistantUseCase: {
        execute: vi.fn(),
      },
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    await screen.loadAssistants()
    screen.form.name = 'Laura Perez'
    screen.form.email = 'laura@example.com'
    screen.form.password = 'password123'
    screen.form.phone = '999888777'
    screen.form.specialty = 'Atencion administrativa'

    await screen.submitAssistant()

    expect(createAssistantUseCase.execute).toHaveBeenCalledWith({
      name: 'Laura Perez',
      email: 'laura@example.com',
      password: 'password123',
      phone: '999888777',
      specialty: 'Atencion administrativa',
      reuseExistingUser: false,
    })
    expect(screen.successMessage.value).toBe('Asistente registrado correctamente.')
    expect(screen.assistants.value).toHaveLength(1)
  })

  it('updates an assistant and reloads the list', async () => {
    const listAssistantsUseCase = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([
          {
            id: 'assistant_1',
            userId: 'assistant_1',
            organizationId: 'org_1',
            name: 'Laura Perez',
            email: 'laura@example.com',
            role: 'assistant',
            phone: '999888777',
            specialty: 'Atencion administrativa',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ])
        .mockResolvedValueOnce([
          {
            id: 'assistant_1',
            userId: 'assistant_1',
            organizationId: 'org_1',
            name: 'Laura Torres',
            email: 'laura@example.com',
            role: 'assistant',
            phone: '111222333',
            specialty: 'Recepcion',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]),
    }

    const updateAssistantUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'assistant_1',
        userId: 'assistant_1',
        organizationId: 'org_1',
        name: 'Laura Torres',
        email: 'laura@example.com',
        role: 'assistant',
        phone: '111222333',
        specialty: 'Recepcion',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }

    const screen = createAssistantsScreen({
      listAssistantsUseCase,
      checkAssistantEmailUseCase: {
        execute: vi.fn().mockResolvedValue({
          status: 'available',
          email: 'laura@example.com',
        }),
      },
      createAssistantUseCase: {
        execute: vi.fn(),
      },
      updateAssistantUseCase,
      deactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      reactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      deleteAssistantUseCase: {
        execute: vi.fn(),
      },
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    await screen.loadAssistants()
    screen.startEditingAssistant(screen.assistants.value[0]!)
    screen.editForm.name = 'Laura Torres'
    screen.editForm.phone = '111222333'
    screen.editForm.specialty = 'Recepcion'

    await screen.submitAssistantUpdate()

    expect(updateAssistantUseCase.execute).toHaveBeenCalledWith({
      userId: 'assistant_1',
      name: 'Laura Torres',
      phone: '111222333',
      specialty: 'Recepcion',
    })
    expect(screen.successMessage.value).toBe('Asistente actualizado correctamente.')
    expect(screen.assistants.value[0]?.name).toBe('Laura Torres')
  })

  it('deactivates an assistant and reloads the list', async () => {
    const deactivateAssistantUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'assistant_1',
        userId: 'assistant_1',
        organizationId: 'org_1',
        name: 'Laura Perez',
        email: 'laura@example.com',
        role: 'assistant',
        phone: '999888777',
        specialty: 'Atencion administrativa',
        isActive: false,
        deactivatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }

    const screen = createAssistantsScreen({
      listAssistantsUseCase: {
        execute: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'assistant_1',
              userId: 'assistant_1',
              organizationId: 'org_1',
              name: 'Laura Perez',
              email: 'laura@example.com',
              role: 'assistant',
              phone: '999888777',
              specialty: 'Atencion administrativa',
              isActive: true,
              deactivatedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'assistant_1',
              userId: 'assistant_1',
              organizationId: 'org_1',
              name: 'Laura Perez',
              email: 'laura@example.com',
              role: 'assistant',
              phone: '999888777',
              specialty: 'Atencion administrativa',
              isActive: false,
              deactivatedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
      },
      checkAssistantEmailUseCase: {
        execute: vi.fn().mockResolvedValue({
          status: 'available',
          email: 'laura@example.com',
        }),
      },
      createAssistantUseCase: {
        execute: vi.fn(),
      },
      updateAssistantUseCase: {
        execute: vi.fn(),
      },
      deactivateAssistantUseCase,
      reactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      deleteAssistantUseCase: {
        execute: vi.fn(),
      },
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    await screen.loadAssistants()
    await screen.deactivateAssistant('assistant_1')

    expect(deactivateAssistantUseCase.execute).toHaveBeenCalledWith({ userId: 'assistant_1' })
    expect(screen.successMessage.value).toBe('Asistente desvinculado correctamente.')
    expect(screen.assistants.value[0]?.isActive).toBe(false)
  })

  it('reactivates an assistant and reloads the list', async () => {
    const reactivateAssistantUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'assistant_1',
        userId: 'assistant_1',
        organizationId: 'org_1',
        name: 'Laura Perez',
        email: 'laura@example.com',
        role: 'assistant',
        phone: '999888777',
        specialty: 'Atencion administrativa',
        isActive: true,
        deactivatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }

    const screen = createAssistantsScreen({
      listAssistantsUseCase: {
        execute: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'assistant_1',
              userId: 'assistant_1',
              organizationId: 'org_1',
              name: 'Laura Perez',
              email: 'laura@example.com',
              role: 'assistant',
              phone: '999888777',
              specialty: 'Atencion administrativa',
              isActive: false,
              deactivatedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'assistant_1',
              userId: 'assistant_1',
              organizationId: 'org_1',
              name: 'Laura Perez',
              email: 'laura@example.com',
              role: 'assistant',
              phone: '999888777',
              specialty: 'Atencion administrativa',
              isActive: true,
              deactivatedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
      },
      checkAssistantEmailUseCase: {
        execute: vi.fn().mockResolvedValue({
          status: 'available',
          email: 'laura@example.com',
        }),
      },
      createAssistantUseCase: {
        execute: vi.fn(),
      },
      updateAssistantUseCase: {
        execute: vi.fn(),
      },
      deactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      reactivateAssistantUseCase,
      deleteAssistantUseCase: {
        execute: vi.fn(),
      },
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    await screen.loadAssistants()
    await screen.reactivateAssistant('assistant_1')

    expect(reactivateAssistantUseCase.execute).toHaveBeenCalledWith({ userId: 'assistant_1' })
    expect(screen.successMessage.value).toBe('Asistente vinculado nuevamente.')
    expect(screen.assistants.value[0]?.isActive).toBe(true)
  })

  it('deletes an assistant permanently and reloads the list', async () => {
    const deleteAssistantUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    }

    const screen = createAssistantsScreen({
      listAssistantsUseCase: {
        execute: vi
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'assistant_1',
              userId: 'assistant_1',
              organizationId: 'org_1',
              name: 'Laura Perez',
              email: 'laura@example.com',
              role: 'assistant',
              phone: '999888777',
              specialty: 'Atencion administrativa',
              isActive: false,
              deactivatedAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ])
          .mockResolvedValueOnce([]),
      },
      checkAssistantEmailUseCase: {
        execute: vi.fn().mockResolvedValue({
          status: 'available',
          email: 'laura@example.com',
        }),
      },
      createAssistantUseCase: {
        execute: vi.fn(),
      },
      updateAssistantUseCase: {
        execute: vi.fn(),
      },
      deactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      reactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      deleteAssistantUseCase,
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    await screen.loadAssistants()
    await screen.deleteAssistant('assistant_1')

    expect(deleteAssistantUseCase.execute).toHaveBeenCalledWith({ userId: 'assistant_1' })
    expect(screen.successMessage.value).toBe('Asistente eliminado definitivamente.')
    expect(screen.assistants.value).toHaveLength(0)
  })

  it('opens a reuse dialog when the email belongs to an orphan user', async () => {
    const checkAssistantEmailUseCase = {
      execute: vi.fn().mockResolvedValue({
        status: 'orphan_reusable',
        email: 'laura@example.com',
        userId: 'assistant_orphan',
        name: 'Laura Huerfana',
      }),
    }

    const createAssistantUseCase = {
      execute: vi.fn(),
    }

    const screen = createAssistantsScreen({
      listAssistantsUseCase: {
        execute: vi.fn().mockResolvedValue([]),
      },
      checkAssistantEmailUseCase,
      createAssistantUseCase,
      updateAssistantUseCase: {
        execute: vi.fn(),
      },
      deactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      reactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      deleteAssistantUseCase: {
        execute: vi.fn(),
      },
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    screen.form.name = 'Laura Huerfana'
    screen.form.email = 'laura@example.com'
    screen.form.password = 'password123'

    await screen.submitAssistant()

    expect(checkAssistantEmailUseCase.execute).toHaveBeenCalledWith('laura@example.com')
    expect(createAssistantUseCase.execute).not.toHaveBeenCalled()
    expect(screen.reuseDialog.open).toBe(true)
  })

  it('reuses the orphan user after confirmation', async () => {
    const createAssistantUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: 'assistant_orphan',
        userId: 'assistant_orphan',
        organizationId: 'org_1',
        name: 'Laura Huerfana',
        email: 'laura@example.com',
        role: 'assistant',
        phone: '999888777',
        specialty: 'Atencion administrativa',
        isActive: true,
        deactivatedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }

    const screen = createAssistantsScreen({
      listAssistantsUseCase: {
        execute: vi.fn().mockResolvedValue([]),
      },
      checkAssistantEmailUseCase: {
        execute: vi.fn().mockResolvedValue({
          status: 'orphan_reusable',
          email: 'laura@example.com',
          userId: 'assistant_orphan',
          name: 'Laura Huerfana',
        }),
      },
      createAssistantUseCase,
      updateAssistantUseCase: {
        execute: vi.fn(),
      },
      deactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      reactivateAssistantUseCase: {
        execute: vi.fn(),
      },
      deleteAssistantUseCase: {
        execute: vi.fn(),
      },
      getAssistantScreenContextUseCase: {
        execute: vi.fn().mockResolvedValue({
          userId: 'user_1',
          organizationId: 'org_1',
          role: 'admin_doctor',
        }),
      },
    })

    screen.form.name = 'Laura Huerfana'
    screen.form.email = 'laura@example.com'
    screen.form.password = 'password123'
    screen.form.phone = '999888777'
    screen.form.specialty = 'Atencion administrativa'

    await screen.submitAssistant()
    await screen.confirmReuseAssistant()

    expect(createAssistantUseCase.execute).toHaveBeenCalledWith({
      name: 'Laura Huerfana',
      email: 'laura@example.com',
      password: 'password123',
      phone: '999888777',
      specialty: 'Atencion administrativa',
      reuseExistingUser: true,
    })
    expect(screen.reuseDialog.open).toBe(false)
  })
})
