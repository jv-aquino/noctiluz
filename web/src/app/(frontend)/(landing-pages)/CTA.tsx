import Embarcar from "./EmbarcarButton";

function CTA({ isLogged }: { isLogged: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="text-5xl font-bold mb-4">Pronto para começar?</h2>
      <p className="text-lg mb-8">Junte-se a nós e transforme sua aprendizagem!</p>
      <Embarcar isLogged={isLogged} />
    </div>
  );
}

export default CTA;