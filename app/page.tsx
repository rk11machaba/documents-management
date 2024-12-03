import Image from "next/image";
import Link from "next/link";
import Documents from '@/components/documents'
import AddDoc from '@/components/add_document';

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col lg:flex-row items-center bg-[#2B2828] dark:bg-slate-800">
        <div className="p-10 flex flex-col bg-[#2B2828] dark:bg-slate-800 text-white space-y-5">
          <h1 className="text-5xl font-bold">MyDocs</h1>
          
          <p className="pb-20">
            Have control to your documents...
          </p>
          <Documents/>
          <AddDoc/>
        </div>
      </div>
    </main>
  );
}