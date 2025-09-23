import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

function Footer() {
  return ( 
    <footer className="px-8">
      <div className="border-t border-border container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">

            </div>
            <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
              A plataforma educacional que revoluciona o aprendizado de exatas no ensino superior. 
              Aprenda de forma inteligente e personalizada, <strong>no seu tempo</strong>.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Plataforma</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cursos</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Questões</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Biblioteca</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Simulados</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contato</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Comunidade</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 noctiluz. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Termos
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
   );
}

export default Footer;