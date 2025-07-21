import { useState } from "react";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";

interface LatexExample {
  name: string;
  description: string;
  inline?: string;
  block?: string;
}

const examples: LatexExample[] = [
  {
    name: "Basic Math",
    description: "Simple arithmetic and fractions",
    inline: "$2 + 2 = 4$ and $\\frac{1}{2}$",
    block: "$$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$$"
  },
  {
    name: "Greek Letters",
    description: "Common Greek letters in math",
    inline: "$\\alpha, \\beta, \\gamma, \\delta$",
    block: "$$\\theta = \\frac{\\pi}{2}$$"
  },
  {
    name: "Summation",
    description: "Sum and product notation",
    inline: "$\\sum_{i=1}^{n} x_i$",
    block: "$$\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n$$"
  },
  {
    name: "Integrals",
    description: "Definite and indefinite integrals",
    inline: "$\\int f(x) dx$",
    block: "$$\\int_{0}^{1} x^2 dx = \\frac{1}{3}$$"
  },
  {
    name: "Matrices",
    description: "Matrix notation",
    block: "$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$"
  },
  {
    name: "Equations",
    description: "Multi-line equations",
    block: "$$\\begin{align} y &= mx + b \\\\ &= 2x + 3 \\end{align}$$"
  }
];

export default function LatexExamples() {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        LaTeX Examples
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Use <code className="bg-gray-200 px-1 rounded">$...$</code> for inline math and <code className="bg-gray-200 px-1 rounded">$$...$$</code> for block math.
          </p>
          
          {examples.map((example, index) => (
            <div key={index} className="border border-gray-200 rounded p-3 bg-white">
              <h4 className="font-medium text-gray-900 mb-1">{example.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{example.description}</p>
              
              {example.inline && (
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Inline:</span>
                    <button
                      onClick={() => copyToClipboard(example.inline!)}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <code className="text-xs bg-gray-100 p-2 rounded block">{example.inline}</code>
                </div>
              )}
              
              {example.block && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Block:</span>
                    <button
                      onClick={() => copyToClipboard(example.block!)}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <code className="text-xs bg-gray-100 p-2 rounded block">{example.block}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 