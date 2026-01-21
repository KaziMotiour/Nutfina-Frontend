"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getCurrentUser, updateUser, clearError } from "@/store/reducers/userSlice";
import { showSuccessToast, showErrorToast } from "@/components/toast-popup/Toastify";

export interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
}

const ProfileEdit = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.user);
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Fetch current user data on mount
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  // Populate form when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar_url || user.avatar || "",
      });
      if (user.avatar_url || user.avatar) {
        setAvatarPreview(user.avatar_url || user.avatar || null);
      }
    }
  }, [user]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      // Create FormData if avatar file is selected, otherwise use JSON
      let updateData: FormData | { full_name: string; phone: string };
      
      if (avatarFile) {
        const formDataObj = new FormData();
        formDataObj.append("full_name", formData.fullName.trim());
        formDataObj.append("phone", formData.phone);
        formDataObj.append("avatar", avatarFile);
        updateData = formDataObj;
      } else {
        updateData = {
          full_name: formData.fullName.trim(),
          phone: formData.phone,
        };
      }

      const result = await dispatch(updateUser(updateData));
      
      if (updateUser.fulfilled.match(result)) {
        showSuccessToast("Profile updated successfully!");
        // Refresh user data
        await dispatch(getCurrentUser());
        // Redirect to the user profile page after editing
        router.push("/user-profile");
      } else {
        showErrorToast(result.payload as string || "Failed to update profile");
      }
    } catch (err: any) {
      showErrorToast(err.message || "An unexpected error occurred");
    }
  };

  return (
    <>
      <section className="gi-register padding-tb-40">
        <div className="container">
          <div className="section-title-2">
            <h2 className="gi-title">
              Edit Profile<span></span>
            </h2>
            <p>Best place to buy and sell digital products.</p>
          </div>
          <div className="row">
            <div 
              className="gi-register-wrapper"
              style={{
                maxWidth: "50%",
                margin: "0 auto",
                width: "100%"
              }}
            >
              <div className="gi-register-container">
                <div className="gi-register-form">
                  <Form 
                    noValidate 
                    validated={validated}
                    className="gi-blog-form"
                    action="#"
                    method="post"
                    onSubmit={handleSubmit}
                  >
                    <span className="gi-register-wrap">
                      <label>Full Name*</label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          name="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          Please Enter Full Name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </span>
                    <span style={{ marginTop: "10px" }} className="gi-register-wrap">
                      <label>Email*</label>
                      <Form.Group>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Enter your email add..."
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          readOnly
                          disabled
                          style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please Enter correct username.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </span>
                    <span style={{ marginTop: "10px" }} className="gi-register-wrap">
                      <label>Phone Number*</label>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          name="phone"
                          placeholder="Enter your phone number"
                          pattern="^\d{10,12}$"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please Enter 10-12 digit number.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </span>
                    <span style={{ paddingTop: "10px", marginTop: "10px" }} className="gi-register-wrap">
                      <label>Profile Photo</label>
                      <input
                        style={{ paddingTop: "10px" }}
                        type="file"
                        id="profilePhoto"
                        name="profilePhoto"
                        onChange={handleFileChange}
                      />
                      {(avatarPreview || formData.avatar) && (
                        <div style={{ marginTop: "10px" }}>
                          <img
                            src={avatarPreview || formData.avatar}
                            alt="Profile"
                            width="100"
                            height="100"
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                          />
                        </div>
                      )}
                    </span>
                    {error && (
                      <div style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
                        {error}
                      </div>
                    )}
                    <span
                      style={{ justifyContent: "end", marginTop: "10px" }}
                      className="gi-register-wrap gi-register-btn"
                    >
                      <button 
                        className="gi-btn-1" 
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                    </span>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProfileEdit;
