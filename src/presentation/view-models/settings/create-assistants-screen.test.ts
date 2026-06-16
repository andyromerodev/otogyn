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
      createAssistantUseCase: {
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
      createAssistantUseCase,
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
    })
    expect(screen.successMessage.value).toBe('Asistente registrado correctamente.')
    expect(screen.assistants.value).toHaveLength(1)
  })
})
