import QuoteForm from "@/components/QuoteForm";

const NewQuote = () => {
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>
      
      <QuoteForm />
    </div>
  );
};

export default NewQuote;
