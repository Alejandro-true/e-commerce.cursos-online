import { draft, version } from '../../../testing/course-fixtures';
import { publicationChecks } from './publication-checks';
describe('Regla de publicación RN02/RN09', () => {
  const ready = () => {
    const value = structuredClone(version);
    value.modulos[0].lecciones[0].estadoVideo = 'LISTO';
    return value;
  };
  it('bloquea una versión sin módulos ni lecciones', () =>
    expect(publicationChecks(draft, { ...version, modulos: [] }).every((c) => c.complete)).toBe(
      false,
    ));
  it('bloquea una lectura sin video aunque exista una lección', () => {
    const v = ready();
    v.modulos[0].lecciones[0].tipo = 'LECTURA';
    expect(publicationChecks(draft, v).every((c) => c.complete)).toBe(false);
  });
  it('bloquea un video pendiente', () =>
    expect(publicationChecks(draft, version).every((c) => c.complete)).toBe(false));
  it('no cuenta un video opcional como el video obligatorio', () => {
    const v = ready();
    v.modulos[0].lecciones[0].obligatorio = false;
    expect(publicationChecks(draft, v).every((c) => c.complete)).toBe(false);
  });
  it('habilita con módulo, lección obligatoria, video listo y precio', () =>
    expect(publicationChecks(draft, ready()).every((c) => c.complete)).toBe(true));
  it('bloquea si falta precio o moneda', () => {
    expect(
      publicationChecks({ ...draft, precioBase: null }, ready()).every((c) => c.complete),
    ).toBe(false);
    expect(publicationChecks({ ...draft, moneda: null }, ready()).every((c) => c.complete)).toBe(
      false,
    );
  });
  it('mantiene bloqueados los cursos archivados y las versiones publicadas', () => {
    expect(
      publicationChecks({ ...draft, estado: 'ARCHIVADO' }, ready()).every((c) => c.complete),
    ).toBe(false);
    expect(
      publicationChecks(draft, { ...ready(), estado: 'PUBLICADA' }).every((c) => c.complete),
    ).toBe(false);
  });
});
