import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { CheckoutService } from '../src/services/CheckoutService.js';
import { UserMother } from './builders/UserMother.js';
import { Item } from '../src/domain/Item.js';

describe('quando o pagamento falha', () => {
	test('deve retornar null e não persistir nem enviar e-mail', async () => {
		const carrinho = new CarrinhoBuilder().build();

		const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };

		const repositoryDummy = { salvar: jest.fn() };
		const emailServiceDummy = { enviarEmail: jest.fn() };

		const checkoutService = new CheckoutService(gatewayStub, repositoryDummy, emailServiceDummy);

		const pedido = await checkoutService.processarPedido(carrinho, '4111111111111111');

		expect(pedido).toBeNull();
		expect(gatewayStub.cobrar).toHaveBeenCalled();
		expect(repositoryDummy.salvar).not.toHaveBeenCalled();
		expect(emailServiceDummy.enviarEmail).not.toHaveBeenCalled();
	});
});

describe('quando um cliente Premium finaliza a compra', () => {
	test('deve aplicar desconto de 10% e enviar e-mail de confirmação', async () => {
		const usuarioPremium = UserMother.umUsuarioPremium();
		const itens = [new Item('Produto A', 100), new Item('Produto B', 100)];

		const carrinho = new CarrinhoBuilder().comUser(usuarioPremium).comItens(itens).build();

		const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };
		const repositoryStub = { salvar: jest.fn().mockResolvedValue({ id: 42 }) };

		const emailMock = { enviarEmail: jest.fn().mockResolvedValue(undefined) };

		const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailMock);

		const pedidoSalvo = await checkoutService.processarPedido(carrinho, '4111111111111111');

		expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, '4111111111111111');
		expect(repositoryStub.salvar).toHaveBeenCalled();

		expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
		expect(emailMock.enviarEmail).toHaveBeenCalledWith(
			usuarioPremium.email,
			'Seu Pedido foi Aprovado!',
			`Pedido ${pedidoSalvo.id} no valor de R$${180}`
		);
	});
});
