import { useRef, useEffect } from "react";

export default function Modal({
  title,
  content,
  onSubmit,
  isSubmitting,
  formSubmissionType,
}: {
  title: string;
  content: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  formSubmissionType: "modal" | "normal";
}) {
  const submitNumber = useRef(0);
  const labelRef = useRef<HTMLLabelElement | null>(null);

  useEffect(() => {
    if (labelRef.current && formSubmissionType === "modal") {
      if (isSubmitting && submitNumber.current === 0) {
        submitNumber.current = 1;
      } else if (submitNumber.current === 1) {
        labelRef.current.click();
        submitNumber.current = 2;
      }
    }
  }, [formSubmissionType, isSubmitting]);

  return (
    <>
      <input type='checkbox' id='my-modal' className='modal-toggle' />
      <div className='modal'>
        <div className='modal-box'>
          <h3 className='font-bold text-lg'>{title}</h3>
          <p className='py-4'>{content}</p>
          <div className='modal-action'>
            <label
              htmlFor='my-modal'
              aria-disabled={isSubmitting}
              className={`btn btn-ghost`}
            >
              No
            </label>
            <label
              ref={labelRef}
              className='hidden'
              htmlFor='my-modal'
              onClick={onSubmit}
            >
              {isSubmitting ? "Loading" : "Yes"}
            </label>
            <label
              aria-disabled={isSubmitting}
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              onClick={onSubmit}
            >
              {isSubmitting ? "Loading" : "Yes"}
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
