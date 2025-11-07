import { User } from '../../src/domain/User.js';

export class UserMother {
	static umUsuarioPadrao() {
		return new User(1, 'João Silva', 'joao.silva@example.com', 'PADRAO');
	}

	static umUsuarioPremium() {
		return new User(2, 'Maria Souza', 'maria.souza@example.com', 'PREMIUM');
	}
}

test('UserMother helper - noop', () => {});
