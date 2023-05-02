import { Link } from "@remix-run/react";

export default function Navbar({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  return (
    <div className='navbar'>
      <div className='flex-1'>
        <Link to='/' className='flex items-center justify-center  ml-2'>
          <img
            src='/pog-image.jpeg'
            alt=''
            height='40'
            width='40'
            className='rounded-full mr-2'
          />
          <span className='normal-case text-xl'>memeMind</span>
        </Link>
      </div>
      {userId && (
        <div className='flex-none'>
          <div className='dropdown dropdown-end '>
            <label tabIndex={0} className='btn btn-ghost btn-circle avatar'>
              <div className='avatar placeholder'>
                <div className='bg-neutral-focus text-neutral-content rounded-full w-10'>
                  <span>{name[0].toUpperCase()}</span>
                </div>
              </div>
            </label>
            <ul
              tabIndex={0}
              className='menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 '
            >
              <li>
                <Link to='/logout'>Logout</Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
