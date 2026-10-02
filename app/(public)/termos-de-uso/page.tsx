import type {
  Metadata,
} from 'next';

import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'Termos de Uso | Biosfera Rádio TV Web',
  description:
    'Termos de Uso do Portal Biosfera Rádio TV Web.',
};

export default function Page() {
  return (
    <article
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        paddingBottom: '60px',
      }}
    >
      <p className="eyebrow">
        INSTITUCIONAL
      </p>

      <h1>
        Termos de Uso
      </h1>

      <p>
        Última atualização:
        1º de outubro de 2026.
      </p>

      <p>
        Estes Termos de Uso
        estabelecem as condições
        para acesso e utilização
        do Portal Biosfera Rádio
        TV Web.
      </p>

      <h2>
        1. Aceitação
      </h2>

      <p>
        Ao acessar o portal, o
        usuário declara estar
        ciente destes termos e
        compromete-se a utilizar
        o serviço de forma lícita
        e responsável.
      </p>

      <h2>
        2. Conteúdo do portal
      </h2>

      <p>
        O portal disponibiliza
        conteúdos jornalísticos,
        informativos,
        institucionais,
        audiovisuais, rádio ao
        vivo, TV ao vivo,
        programação e outros
        recursos relacionados à
        Biosfera.
      </p>

      <h2>
        3. Uso permitido
      </h2>

      <p>
        O usuário não deverá:
      </p>

      <ul>
        <li>
          utilizar o portal para
          atividades ilícitas;
        </li>

        <li>
          tentar acessar áreas
          restritas sem
          autorização;
        </li>

        <li>
          interferir na
          segurança,
          disponibilidade ou
          funcionamento do
          serviço;
        </li>

        <li>
          introduzir códigos
          maliciosos ou realizar
          ataques;
        </li>

        <li>
          utilizar conteúdo de
          forma que viole
          direitos autorais,
          marcas ou outros
          direitos aplicáveis.
        </li>
      </ul>

      <h2>
        4. Direitos autorais e
        propriedade intelectual
      </h2>

      <p>
        Textos, marcas,
        identidade visual,
        fotografias, vídeos,
        áudios e demais conteúdos
        podem estar protegidos
        por direitos autorais,
        direitos de imagem,
        marcas ou licenças de
        terceiros.
      </p>

      <p>
        A disponibilização de
        conteúdo no portal não
        implica autorização para
        reprodução comercial ou
        redistribuição fora das
        hipóteses permitidas por
        lei ou por autorização
        expressa.
      </p>

      <h2>
        5. Conteúdo de terceiros
      </h2>

      <p>
        O portal pode apresentar
        players, vídeos, anúncios,
        links e serviços
        fornecidos por terceiros.
        A Biosfera não controla
        integralmente sistemas
        externos e suas
        respectivas políticas.
      </p>

      <h2>
        6. Disponibilidade
      </h2>

      <p>
        A Biosfera busca manter o
        portal disponível, porém
        podem ocorrer
        interrupções decorrentes
        de manutenção, falhas de
        infraestrutura,
        fornecedores externos,
        internet, streaming ou
        situações fora do
        controle razoável do
        portal.
      </p>

      <h2>
        7. Informações
        jornalísticas
      </h2>

      <p>
        Conteúdos podem ser
        atualizados, corrigidos,
        complementados ou
        retirados quando
        necessário.
      </p>

      <h2>
        8. Participação do
        usuário
      </h2>

      <p>
        Quando o portal permitir
        comentários, chat,
        formulários ou outros
        recursos participativos,
        o usuário será
        responsável pelas
        informações e conteúdos
        que enviar.
      </p>

      <p>
        Conteúdo abusivo,
        ilegal, ofensivo,
        fraudulento ou que viole
        direitos de terceiros
        poderá ser moderado ou
        removido.
      </p>

      <h2>
        9. Privacidade
      </h2>

      <p>
        O tratamento de dados
        pessoais é explicado na{' '}
        <Link href="/politica-de-privacidade">
          Política de Privacidade
        </Link>
        .
      </p>

      <h2>
        10. Cookies
      </h2>

      <p>
        Informações sobre cookies
        e tecnologias semelhantes
        estão disponíveis na{' '}
        <Link href="/politica-de-cookies">
          Política de Cookies
        </Link>
        .
      </p>

      <h2>
        11. Alterações
      </h2>

      <p>
        Estes termos poderão ser
        atualizados sempre que
        necessário. A versão
        vigente será aquela
        publicada nesta página.
      </p>

      <h2>
        12. Contato
      </h2>

      <p>
        Dúvidas ou solicitações
        podem ser encaminhadas
        pelos canais oficiais do
        portal.
      </p>

      <p>
        <Link
          className="button"
          href="/contato"
        >
          Entrar em contato
        </Link>
      </p>
    </article>
  );
}