use libc::{
  fopen,
  ftell,
  fseek,
  fread,
  fclose,
  FILE,
  SEEK_END,
  SEEK_SET,
  c_void
};
use std::error::Error;
use std::ffi::{CString, NulError};
use std::ptr::null_mut;

struct File {
  f: *mut FILE
}

impl Drop for File {
  fn drop(&mut self) {
    if self.ok() {
      unsafe {
        let r = fclose(self.f);
        if r == 0 {
          self.f = null_mut();
        } else {
          panic!("fclose failed")
        }
      }
    }
    println!("~File()");
  }
}

impl File {
  pub unsafe fn new(
    path: &str,
    mode: &str
  ) -> Result<File, NulError> {
    let cpath = CString::new(path)?;
    let cmode = CString::new(mode)?;
    Ok(File {
      f: fopen(
        cpath.as_ptr(),
        cmode.as_ptr()
      )
    })
  }

  #[inline]
  pub fn ok(&self) -> bool {
    !self.f.is_null()
  }

  pub unsafe fn read_to_string(
    &self
  ) -> Result<String, Box<dyn Error>> {
    fseek(self.f, 0, SEEK_END);
    let len: usize = ftell(self.f).try_into()?;
    fseek(self.f, 0, SEEK_SET);
    let mut b = vec![0_u8; len];
    fread(b.as_mut_ptr() as *mut c_void,
      1_usize, len, self.f);

    Ok(String::from_utf8(b)?)
  }
}

fn main() -> Result<(), Box<dyn Error>> {
  unsafe {
    let file = File::new("Cargo.toml", "r")?;
    let data = file.read_to_string()?;
    println!("{}", data);
  }
  Ok(())
}