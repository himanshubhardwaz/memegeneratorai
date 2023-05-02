import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  getMemeById,
  getCaptionedImageUrl,
  updateMeme,
} from "~/utils/meme-services.server";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData,
  useNavigation,
  useFetcher,
  useParams,
} from "@remix-run/react";
import Modal from "~/components/Modal";
import { useRef, useState } from "react";

export async function loader({ request, params }: LoaderArgs) {
  const id = params.id;
  if (!id) return redirect(`/meme`);

  const meme = await getMemeById(id, request);

  if (meme instanceof Error) {
    throw json({ error: meme.message }, { status: 401 });
  }

  const captionedImageUrl = getCaptionedImageUrl(meme.url, meme.caption);

  return json({ meme, captionedImageUrl });
}

export async function action({ request, params }: ActionArgs) {
  const id = params.id;
  const formData = await request.formData();
  const changedCaption = formData.get("caption");
  const isPublicString = formData.get("isPublic");

  const isPublic = isPublicString === "true";

  if (
    !changedCaption ||
    typeof changedCaption !== "string" ||
    typeof isPublic !== "boolean" ||
    typeof id !== "string"
  ) {
    return json({ error: "Invalid data type" });
  }

  console.log("comming herer");

  try {
    await updateMeme(id, changedCaption, isPublic);
    return redirect(`/meme/my-collection/${id}`);
  } catch (error) {
    return json({ error: "Could not update meme caption" });
  }
}

export default function MemeByIdPage() {
  const [formData, setFormData] = useState<{
    isPublic: boolean;
    caption: string;
  }>({
    isPublic: false,
    caption: "",
  });

  const data = useLoaderData<typeof loader>() || {};
  const fetcher = useFetcher();
  const navigation = useNavigation();
  const modalToggleRef = useRef<HTMLLabelElement | null>(null);

  const formSubmissionType = useRef<"normal" | "modal">("normal");

  const params = useParams();

  const isLoading =
    navigation.state === "submitting" ||
    navigation.state === "loading" ||
    fetcher.state === "submitting";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    const formElements = form.elements as typeof form.elements & {
      isPublic: HTMLInputElement;
      initialIsPublic: HTMLInputElement;
      caption: HTMLInputElement;
    };

    const isPublic = formElements.isPublic.checked;
    const initialIsPublic = formElements.initialIsPublic.checked;
    const caption = formElements.caption.value;

    setFormData({ caption, isPublic });

    if (!initialIsPublic && isPublic && modalToggleRef.current) {
      formSubmissionType.current = "modal";
      modalToggleRef.current.click();
    } else {
      formSubmissionType.current = "normal";
      fetcher.submit(
        { caption, isPublic: String(isPublic) },
        {
          method: "post",
          action: `/meme/my-collection/${params.id}`,
        }
      );
    }
  };

  const onSubmit = () => {
    fetcher.submit(
      { caption: formData.caption, isPublic: String(formData.isPublic) },
      {
        method: "post",
        action: `/meme/my-collection/${params.id}`,
      }
    );
  };

  return (
    <>
      <label htmlFor='my-modal' className='hidden' ref={modalToggleRef}>
        open modal
      </label>
      <div className='flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 gap-8'>
        <img src={data.captionedImageUrl} alt='' height='500' width='500' />
        <fetcher.Form
          className='flex-shrink-0 w-full max-w-sm bg-base-100'
          method='POST'
          onSubmit={(e) => handleSubmit(e)}
        >
          <input
            value={data.meme.isPublic ? "on" : "off"}
            readOnly
            type='hidden'
            name='initialIsPublic'
          />
          <div className='form-control'>
            <label className='label' htmlFor='caption'>
              <span className='label-text'>Caption</span>
            </label>
            <textarea
              className='textarea textarea-bordered'
              defaultValue={data.meme.caption.trim()}
              name='caption'
              data-gramm='false'
              data-gramm_editor='false'
              data-enable-grammarly='false'
            />
          </div>

          <div className='flex items-center gap-2 mt-6'>
            <label className='label' htmlFor='isPublic'>
              <span>Make it public: </span>
            </label>
            <input
              type='checkbox'
              defaultChecked={data.meme.isPublic}
              className='checkbox'
              name='isPublic'
            />
          </div>
          <div className='form-control mt-6'>
            <button
              className='btn btn-primary'
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Save"}
            </button>
          </div>
        </fetcher.Form>
      </div>
      <Modal
        title="Are you sure you want to modify this meme's accessibility?"
        content='By doing so, your meme will become public and might get featured on the popular memes page'
        isSubmitting={isLoading}
        onSubmit={onSubmit}
        formSubmissionType={formSubmissionType.current}
      />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return (
      <h1 className='flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 gap-8'>
        Unknown Error
      </h1>
    );
  }
}
