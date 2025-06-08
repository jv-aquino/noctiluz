import Link from "next/link";

interface AdminLinkProps {
  selected: boolean;
  item: {
    url: string;
    title: string;
    icon: React.ComponentType;
  }
}

function AdminLink({ selected, item }: AdminLinkProps) {
  return ( 
    <Link 
      href={item.url} 
      className={("flex gap-3 " + (selected ? 'bg-pink-700 hover:bg-pink-700' : ''))}
    >
      <item.icon />
      <span>{item.title}</span>
    </Link>
   );
}

export default AdminLink;